import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma, ReceivableStatus, SalePaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSaleDto) {
    const warung = await this.prisma.warung.findFirst({ where: { id: dto.warungId, deletedAt: null } });
    if (!warung) {
      throw new NotFoundException('Warung not found');
    }
    if (warung.isBlocked) {
      throw new BadRequestException(`Warung is blocked: ${warung.blockedReason ?? 'unknown reason'}`);
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, deletedAt: null },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: dto.items.map((item) => item.productId) },
        deletedAt: null,
      },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Some products are invalid');
    }

    const lineItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = item.price ?? Number(product.sellPrice);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
      };
    });

    const totalAmount = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const paidAmount = dto.paidAmount ?? (dto.paymentMethod === SalePaymentMethod.CREDIT ? 0 : totalAmount);

    if (paidAmount > totalAmount) {
      throw new BadRequestException('paidAmount cannot be greater than totalAmount');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of lineItems) {
        const stock = await tx.stock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: dto.warehouseId,
              productId: item.productId,
            },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
        }

        await tx.stock.update({
          where: {
            warehouseId_productId: {
              warehouseId: dto.warehouseId,
              productId: item.productId,
            },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            movementType: MovementType.OUT,
            productId: item.productId,
            fromWarehouseId: dto.warehouseId,
            quantity: item.quantity,
            referenceType: 'SALES',
            createdBy: userId,
          },
        });
      }

      const sale = await tx.sale.create({
        data: {
          invoiceNumber: await this.generateInvoiceNumber(tx),
          warungId: dto.warungId,
          warehouseId: dto.warehouseId,
          paymentMethod: dto.paymentMethod,
          totalAmount,
          paidAmount,
          notes: dto.notes,
          createdBy: userId,
          items: {
            create: lineItems,
          },
        },
        include: {
          items: { include: { product: true } },
          warung: true,
        },
      });

      const balance = totalAmount - paidAmount;
      if (balance > 0) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + warung.creditDays);

        await tx.receivable.create({
          data: {
            warungId: dto.warungId,
            saleId: sale.id,
            amount: totalAmount,
            paidAmount,
            balance,
            dueDate,
            status: paidAmount > 0 ? ReceivableStatus.PARTIAL : ReceivableStatus.UNPAID,
            notes: `Receivable from sale ${sale.invoiceNumber}`,
          },
        });

        await tx.warung.update({
          where: { id: warung.id },
          data: {
            currentDebt: {
              increment: balance,
            },
          },
        });
      }

      return sale;
    });
  }

  async list(query: QuerySaleDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = {
      deletedAt: null,
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
          items: true,
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
      where: { id, deletedAt: null },
      include: {
        warung: true,
        items: { include: { product: true } },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async dailySummary(date?: string) {
    const target = date ? new Date(date) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const summary = await this.prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        deletedAt: null,
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

