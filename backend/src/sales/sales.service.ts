import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) { }

  async create(userId: string, dto: CreateSaleDto) {
    const warung = await this.prisma.warung.findFirst({
      where: { id: dto.warungId, deletedAt: null },
      include: { taxSettings: true }
    });
    if (!warung) {
      throw new NotFoundException('Warung not found');
    }
    if (warung.isBlocked) {
      throw new BadRequestException('Warung is blocked');
    }

    const warungProducts = await this.prisma.warungProduct.findMany({
      where: {
        id: { in: dto.items.map((item) => item.warungProductId) },
        warungId: dto.warungId,
      },
      include: {
        product: true,
        wholesalePrices: true,
        recipes: { include: { ingredient: true } },
        modifierGroups: { include: { modifierGroup: { include: { modifiers: true } } } }
      },
    });

    if (warungProducts.length !== dto.items.length) {
      throw new BadRequestException('Some products are invalid or not found in warung inventory');
    }

    // 1. Calculate prices including Wholesale and Modifiers
    const lineItems = dto.items.map((dtoItem) => {
      const wp = warungProducts.find((p) => p.id === dtoItem.warungProductId)!;

      // Auto-Wholesale logic
      let unitPrice = Number(wp.sellingPrice);
      const appliedWholesale = wp.wholesalePrices
        .filter(w => dtoItem.quantity >= w.minQty)
        .sort((a, b) => b.minQty - a.minQty)[0]; // Use highest matching minQty

      if (appliedWholesale) {
        unitPrice = Number(appliedWholesale.price);
      }

      // Modifier mapping
      const modifiers = (dtoItem.modifiers ?? []).map(m => {
        const mod = wp.modifierGroups
          .flatMap(g => g.modifierGroup.modifiers)
          .find(mod => mod.id === m.modifierId);

        if (!mod) throw new BadRequestException(`Invalid modifier ID ${m.modifierId}`);

        return {
          modifierId: mod.id,
          name: mod.name,
          price: mod.price,
        };
      });

      const modifierTotal = modifiers.reduce((sum, m) => sum + Number(m.price), 0);
      const finalPrice = dtoItem.price ?? (unitPrice + modifierTotal);
      const discount = dtoItem.discount ?? 0;

      return {
        warungProductId: dtoItem.warungProductId,
        quantity: dtoItem.quantity,
        costPrice: wp.costPrice,
        price: finalPrice,
        discount,
        subtotal: (finalPrice - discount) * dtoItem.quantity,
        modifiers: modifiers,
        productName: wp.product.name,
        recipe: wp.recipes,
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Tax & Service logic
    const taxRate = warung.taxSettings?.taxRate ? Number(warung.taxSettings.taxRate) : 0;
    const serviceRate = warung.taxSettings?.serviceRate ? Number(warung.taxSettings.serviceRate) : 0;

    const taxAmount = (subtotal * taxRate) / 100;
    const serviceAmount = (subtotal * serviceRate) / 100;

    const totalAmount = subtotal - (dto.discountAmount ?? 0) + taxAmount + serviceAmount;
    const paidAmount = dto.paidAmount ?? totalAmount;

    if (paidAmount > totalAmount) {
      throw new BadRequestException('paidAmount cannot be greater than totalAmount');
    }

    const sale = await this.prisma.$transaction(async (tx) => {
      // 2. Verify shift
      if (dto.shiftId) {
        const shift = await tx.shift.findUnique({ where: { id: dto.shiftId } });
        if (!shift || shift.endTime) throw new BadRequestException('Invalid or closed shift');
      }

      // 3. Process Inventory (Stock & Ingredients)
      for (const item of lineItems) {
        const wp = warungProducts.find((p) => p.id === item.warungProductId)!;

        // Deduck product stock if it's not a service/virtual product (optional check)
        if (wp.stockQty < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${item.productName}`);
        }

        await tx.warungProduct.update({
          where: { id: wp.id },
          data: { stockQty: { decrement: item.quantity } },
        });

        // Deduck ingredients based on recipe
        for (const r of item.recipe) {
          const reqQty = Number(r.quantity) * item.quantity;
          await tx.ingredient.update({
            where: { id: r.ingredientId },
            data: { stockQty: { decrement: reqQty } }
          });
        }

        await tx.stockMovement.create({
          data: {
            movementType: MovementType.OUT,
            productId: wp.productId,
            quantity: item.quantity,
            referenceType: 'SALE',
            createdBy: userId,
          },
        });
      }

      // 4. Create Sale Record
      const saleRecord = await tx.sale.create({
        data: {
          invoiceNumber: await this.generateInvoiceNumber(tx),
          warungId: dto.warungId,
          shiftId: dto.shiftId,
          customerId: dto.customerId,
          paymentMethod: dto.paymentMethod,
          orderType: dto.orderType ?? 'TAKE_AWAY',
          subtotal,
          discountAmount: dto.discountAmount ?? 0,
          taxAmount,
          totalAmount,
          paidAmount,
          taxRate,
          serviceRate,
          items: {
            create: lineItems.map(li => ({
              warungProductId: li.warungProductId,
              quantity: li.quantity,
              costPrice: li.costPrice,
              price: li.price,
              discount: li.discount,
              subtotal: li.subtotal,
              modifiers: {
                create: li.modifiers.map(m => ({
                  modifierId: m.modifierId,
                  name: li.productName + ' - ' + m.name,
                  price: m.price,
                }))
              }
            })),
          },
        },
        include: {
          items: { include: { modifiers: true, warungProduct: { include: { product: true } } } },
          warung: true,
          customer: true,
        },
      });

      // 5. Update Debt
      const balanceAmount = totalAmount - paidAmount;
      if (balanceAmount > 0) {
        if (dto.customerId) {
          await tx.customer.update({
            where: { id: dto.customerId },
            data: { currentDebt: { increment: balanceAmount } },
          });

          await tx.customerDebt.create({
            data: {
              warungId: dto.warungId,
              customerId: dto.customerId,
              saleId: saleRecord.id,
              amount: totalAmount,
              paidAmount: paidAmount,
              balance: balanceAmount,
              status: balanceAmount === totalAmount ? 'UNPAID' : 'PARTIAL',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          await tx.warung.update({
            where: { id: warung.id },
            data: { currentDebt: { increment: balanceAmount } },
          });
        }
      }

      return saleRecord;
    });

    this.realtime.emit('sales.created', {
      saleId: sale.id,
      warungId: sale.warungId,
      totalAmount: sale.totalAmount,
    });

    return sale;
  }

  async list(query: QuerySaleDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = {
      ...(query.warungId ? { warungId: query.warungId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
          createdAt: {
            ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
            ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
          },
        }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        include: {
          warung: true,
          items: { include: { warungProduct: { include: { product: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id },
      include: {
        warung: true,
        items: { include: { warungProduct: { include: { product: true } } } },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async dailySummary(warungId: string, date?: string) {
    const target = date ? new Date(date) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const summary = await this.prisma.sale.aggregate({
      where: {
        warungId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        totalAmount: true,
        paidAmount: true,
      },
      _count: true,
    });

    return {
      date: start.toISOString().slice(0, 10),
      totalTransactions: summary._count,
      totalAmount: Number(summary._sum.totalAmount ?? 0),
      totalPaid: Number(summary._sum.paidAmount ?? 0),
      totalCredit: Number(summary._sum.totalAmount ?? 0) - Number(summary._sum.paidAmount ?? 0),
    };
  }

  private async generateInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now
      .getDate()
      .toString()
      .padStart(2, '0')}`;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const count = await tx.sale.count({ where: { createdAt: { gte: start } } });

    return `INV-${datePart}-${(count + 1).toString().padStart(4, '0')}`;
  }
}
