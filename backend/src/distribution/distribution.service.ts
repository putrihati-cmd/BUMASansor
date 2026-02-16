import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, OrderStatus, POStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class DistributionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) { }

  async createOrder(userId: string, warungId: string, warehouseId: string, items: any[], notes?: string) {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await this.prisma.order.create({
      data: {
        orderNumber: await this.generateOrderNumber(),
        warungId,
        warehouseId,
        totalAmount,
        notes,
        createdBy: userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        warung: true,
      },
    });

    this.realtime.emit('order.created', order);
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { warung: true, items: true },
    });

    this.realtime.emit('order.updated', order);
    return order;
  }

  async assignKurir(orderId: string, kurirId: string) {
    const task = await this.prisma.deliveryTask.upsert({
      where: { orderId },
      update: { kurirId, status: OrderStatus.PENDING },
      create: { orderId, kurirId, status: OrderStatus.PENDING },
    });

    await this.updateOrderStatus(orderId, OrderStatus.APPROVED);

    this.realtime.emit('delivery.assigned', task);
    return task;
  }

  async startDelivery(orderId: string, kurirId: string) {
    const task = await this.prisma.deliveryTask.update({
      where: { orderId },
      data: { status: OrderStatus.IN_TRANSIT, pickedUpAt: new Date() },
    });

    await this.updateOrderStatus(orderId, OrderStatus.IN_TRANSIT);
    return task;
  }

  async completeDelivery(orderId: string, kurirId: string, photoProof?: string) {
    const task = await this.prisma.deliveryTask.update({
      where: { orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
        deliveryPhoto: photoProof,
      },
    });

    await this.updateOrderStatus(orderId, OrderStatus.DELIVERED);

    // Update Warung Inventory after delivery
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order) {
      for (const item of order.items) {
        await this.prisma.warungProduct.upsert({
          where: { warungId_productId: { warungId: order.warungId, productId: item.productId } },
          update: { stockQty: { increment: item.quantity } },
          create: {
            warungId: order.warungId,
            productId: item.productId,
            stockQty: item.quantity,
            sellingPrice: 0, // Should be set by warung later
          },
        });
      }
    }

    return task;
  }

  // PO Methods (Inbound from Supplier)
  async createPurchaseOrder(userId: string, supplierId: string, warehouseId: string, items: any[], notes?: string) {
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // Generate PO Number
    const count = await this.prisma.purchaseOrder.count();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const poNumber = `PO-${date}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        warehouseId,
        totalAmount,
        notes,
        createdBy: userId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  async receivePurchaseOrder(poId: string, userId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });

    if (!po) throw new NotFoundException('PO not found');
    if (po.status === POStatus.RECEIVED) throw new BadRequestException('PO already received');

    return this.prisma.$transaction(async (tx) => {
      // Add Stock
      for (const item of po.items) {
        // Find existing stock to update quantity
        await tx.stock.upsert({
          where: { warehouseId_productId: { warehouseId: po.warehouseId, productId: item.productId } },
          update: { quantity: { increment: item.quantity } },
          create: {
            warehouseId: po.warehouseId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });

        // Movement
        await tx.stockMovement.create({
          data: {
            movementType: MovementType.IN,
            productId: item.productId,
            toWarehouseId: po.warehouseId,
            quantity: item.quantity,
            referenceType: 'PURCHASE_ORDER',
            referenceId: po.id,
            createdBy: userId,
            notes: `Received from PO ${po.poNumber}`,
          },
        });
      }

      return tx.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: POStatus.RECEIVED,
          receivedAt: new Date(),
          receivedBy: userId,
        },
      });
    });
  }

  async listOrders(role: string, userId: string, warungId?: string, status?: OrderStatus) {
    const where: any = {};
    if (role === 'WARUNG') {
      where.warungId = warungId; // Warung can only see their orders
    }
    // GUDANG/ADMIN can see all, or filter by warungId
    if (role !== 'WARUNG' && warungId) {
      where.warungId = warungId;
    }
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        warung: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.prisma.order.count();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `ORD-${date}-${(count + 1).toString().padStart(4, '0')}`;
  }
}
