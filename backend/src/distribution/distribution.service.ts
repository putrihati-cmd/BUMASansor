import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DOStatus, POStatus, ReceivableStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignKurirDto } from './dto/assign-kurir.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';
import { CreateDODto } from './dto/create-do.dto';
import { CreatePODto } from './dto/create-po.dto';

@Injectable()
export class DistributionService {
  constructor(private readonly prisma: PrismaService) {}

  async createPurchaseOrder(userId: string, dto: CreatePODto) {
    await this.ensureSupplier(dto.supplierId);
    await this.ensureWarehouse(dto.warehouseId);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: dto.items.map((item) => item.productId) },
        deletedAt: null,
      },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Some products are invalid');
    }

    const totalAmount = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber: await this.generateDocumentNumber('PO'),
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        notes: dto.notes,
        totalAmount,
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        supplier: true,
        warehouse: true,
      },
    });
  }

  listPurchaseOrders(status?: POStatus, supplierId?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(supplierId ? { supplierId } : {}),
      },
      include: {
        items: { include: { product: true } },
        supplier: true,
        warehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: { include: { product: true } },
        supplier: true,
        warehouse: true,
      },
    });

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    return po;
  }

  async approvePurchaseOrder(id: string, userId: string) {
    const po = await this.findPurchaseOrder(id);
    if (po.status !== POStatus.PENDING) {
      throw new BadRequestException('Only pending PO can be approved');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: POStatus.APPROVED,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });
  }

  async receivePurchaseOrder(id: string, userId: string) {
    const po = await this.findPurchaseOrder(id);
    if (po.status !== POStatus.APPROVED) {
      throw new BadRequestException('PO must be approved before receiving');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPO = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: POStatus.RECEIVED,
          receivedBy: userId,
          receivedAt: new Date(),
        },
      });

      for (const item of po.items) {
        await tx.stock.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: po.warehouseId,
              productId: item.productId,
            },
          },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            warehouseId: po.warehouseId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });

        await tx.stockMovement.create({
          data: {
            movementType: 'IN',
            productId: item.productId,
            toWarehouseId: po.warehouseId,
            quantity: item.quantity,
            referenceType: 'PO',
            referenceId: po.id,
            createdBy: userId,
          },
        });
      }

      return updatedPO;
    });
  }

  async cancelPurchaseOrder(id: string) {
    const po = await this.findPurchaseOrder(id);
    if (po.status !== POStatus.PENDING) {
      throw new BadRequestException('Only pending PO can be cancelled');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.CANCELLED },
    });
  }

  async createDeliveryOrder(userId: string, dto: CreateDODto) {
    const warung = await this.prisma.warung.findFirst({ where: { id: dto.warungId, deletedAt: null } });
    if (!warung) {
      throw new NotFoundException('Warung not found');
    }
    if (warung.isBlocked) {
      throw new BadRequestException(`Warung is blocked: ${warung.blockedReason ?? 'unknown reason'}`);
    }

    await this.ensureWarehouse(dto.warehouseId);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: dto.items.map((item) => item.productId) },
        deletedAt: null,
      },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Some products are invalid');
    }

    const totalAmount = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const availableCredit = Number(warung.creditLimit) - Number(warung.currentDebt);
    if (totalAmount > availableCredit) {
      throw new BadRequestException('Credit limit exceeded');
    }

    const creditDays = dto.creditDays ?? warung.creditDays;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + creditDays);

    return this.prisma.deliveryOrder.create({
      data: {
        doNumber: await this.generateDocumentNumber('DO'),
        warungId: dto.warungId,
        warehouseId: dto.warehouseId,
        totalAmount,
        status: DOStatus.PENDING,
        creditDays,
        dueDate,
        notes: dto.notes,
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        warung: true,
        items: { include: { product: true } },
      },
    });
  }

  listDeliveryOrders(status?: DOStatus, warungId?: string, kurirId?: string) {
    return this.prisma.deliveryOrder.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(warungId ? { warungId } : {}),
        ...(kurirId ? { kurirId } : {}),
      },
      include: {
        warung: true,
        kurir: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDeliveryOrder(id: string) {
    const delivery = await this.prisma.deliveryOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        warung: true,
        kurir: true,
        items: { include: { product: true } },
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery order not found');
    }

    return delivery;
  }

  async assignKurir(id: string, dto: AssignKurirDto) {
    const delivery = await this.findDeliveryOrder(id);
    if (!([DOStatus.PENDING, DOStatus.ASSIGNED] as DOStatus[]).includes(delivery.status)) {
      throw new BadRequestException('Delivery order cannot be assigned');
    }

    const kurir = await this.prisma.user.findFirst({
      where: { id: dto.kurirId, role: Role.KURIR, deletedAt: null },
    });
    if (!kurir) {
      throw new BadRequestException('Kurir not found');
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        kurirId: dto.kurirId,
        status: DOStatus.ASSIGNED,
        assignedAt: new Date(),
      },
    });
  }

  async startDelivery(id: string, userId: string, role: string) {
    const delivery = await this.findDeliveryOrder(id);
    if (delivery.status !== DOStatus.ASSIGNED) {
      throw new BadRequestException('Delivery order must be assigned first');
    }
    if (role === Role.KURIR && delivery.kurirId !== userId) {
      throw new BadRequestException('This delivery is assigned to another kurir');
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: { status: DOStatus.ON_DELIVERY },
    });
  }

  async markDelivered(id: string, userId: string, role: string) {
    const delivery = await this.findDeliveryOrder(id);
    if (delivery.status !== DOStatus.ON_DELIVERY) {
      throw new BadRequestException('Delivery order must be on delivery first');
    }
    if (role === Role.KURIR && delivery.kurirId !== userId) {
      throw new BadRequestException('This delivery is assigned to another kurir');
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: DOStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });
  }

  async confirmDelivery(id: string, userId: string, dto: ConfirmDeliveryDto) {
    const delivery = await this.findDeliveryOrder(id);
    if (!([DOStatus.DELIVERED, DOStatus.ON_DELIVERY] as DOStatus[]).includes(delivery.status)) {
      throw new BadRequestException('Delivery order cannot be confirmed');
    }

    const existingReceivable = await this.prisma.receivable.findFirst({
      where: {
        deliveryOrderId: id,
        deletedAt: null,
      },
    });

    if (existingReceivable) {
      throw new BadRequestException('Delivery order already confirmed');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of delivery.items) {
        const stock = await tx.stock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: delivery.warehouseId,
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
              warehouseId: delivery.warehouseId,
              productId: item.productId,
            },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            movementType: 'OUT',
            productId: item.productId,
            fromWarehouseId: delivery.warehouseId,
            quantity: item.quantity,
            referenceType: 'DO',
            referenceId: delivery.id,
            createdBy: userId,
          },
        });
      }

      const confirmed = await tx.deliveryOrder.update({
        where: { id },
        data: {
          status: DOStatus.CONFIRMED,
          confirmedBy: userId,
          confirmedAt: new Date(),
          photoProof: dto.photoProof,
        },
      });

      await tx.receivable.create({
        data: {
          warungId: delivery.warungId,
          deliveryOrderId: delivery.id,
          amount: delivery.totalAmount,
          balance: delivery.totalAmount,
          dueDate: delivery.dueDate,
          status: ReceivableStatus.UNPAID,
          notes: `Receivable from ${delivery.doNumber}`,
        },
      });

      await tx.warung.update({
        where: { id: delivery.warungId },
        data: {
          currentDebt: {
            increment: delivery.totalAmount,
          },
        },
      });

      return confirmed;
    });
  }

  async cancelDeliveryOrder(id: string) {
    const delivery = await this.findDeliveryOrder(id);
    if (!([DOStatus.PENDING, DOStatus.ASSIGNED] as DOStatus[]).includes(delivery.status)) {
      throw new BadRequestException('Only pending/assigned delivery can be cancelled');
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: { status: DOStatus.CANCELLED },
    });
  }

  private async generateDocumentNumber(prefix: 'PO' | 'DO'): Promise<string> {
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now
      .getDate()
      .toString()
      .padStart(2, '0')}`;

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const count =
      prefix === 'PO'
        ? await this.prisma.purchaseOrder.count({ where: { createdAt: { gte: startOfDay } } })
        : await this.prisma.deliveryOrder.count({ where: { createdAt: { gte: startOfDay } } });

    return `${prefix}-${datePart}-${(count + 1).toString().padStart(3, '0')}`;
  }

  private async ensureSupplier(id: string) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id, deletedAt: null } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
  }

  private async ensureWarehouse(id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({ where: { id, deletedAt: null } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
  }
}

