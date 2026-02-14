import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { QueryStockDto } from './dto/query-stock.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
import { StockOpnameDto } from './dto/stock-opname.dto';

@Injectable()
export class StocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async list(query: QueryStockDto) {
    const where = {
      ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
    };

    const stocks = await this.prisma.stock.findMany({
      where,
      include: {
        warehouse: true,
        product: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!query.lowStock) {
      return stocks;
    }

    return stocks.filter((stock) => stock.quantity < stock.minStock);
  }

  async findOne(warehouseId: string, productId: string) {
    const stock = await this.prisma.stock.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      include: {
        warehouse: true,
        product: true,
      },
    });

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return stock;
  }

  async recordMovement(dto: StockMovementDto, userId: string) {
    await this.ensureProductExists(dto.productId);

    const movement = await this.prisma.$transaction(async (tx) => {
      if (dto.movementType === MovementType.IN) {
        if (!dto.toWarehouseId) {
          throw new BadRequestException('toWarehouseId is required for IN movement');
        }
        await this.ensureWarehouseExists(tx, dto.toWarehouseId);

        await tx.stock.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: dto.toWarehouseId,
              productId: dto.productId,
            },
          },
          update: { quantity: { increment: dto.quantity } },
          create: {
            warehouseId: dto.toWarehouseId,
            productId: dto.productId,
            quantity: dto.quantity,
          },
        });

        return tx.stockMovement.create({
          data: {
            movementType: dto.movementType,
            productId: dto.productId,
            toWarehouseId: dto.toWarehouseId,
            quantity: dto.quantity,
            notes: dto.notes,
            createdBy: userId,
          },
        });
      }

      if (dto.movementType === MovementType.OUT) {
        if (!dto.fromWarehouseId) {
          throw new BadRequestException('fromWarehouseId is required for OUT movement');
        }
        await this.ensureWarehouseExists(tx, dto.fromWarehouseId);

        const stock = await tx.stock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: dto.fromWarehouseId,
              productId: dto.productId,
            },
          },
        });

        if (!stock || stock.quantity < dto.quantity) {
          throw new BadRequestException('Insufficient stock');
        }

        await tx.stock.update({
          where: {
            warehouseId_productId: {
              warehouseId: dto.fromWarehouseId,
              productId: dto.productId,
            },
          },
          data: {
            quantity: { decrement: dto.quantity },
          },
        });

        return tx.stockMovement.create({
          data: {
            movementType: dto.movementType,
            productId: dto.productId,
            fromWarehouseId: dto.fromWarehouseId,
            quantity: dto.quantity,
            notes: dto.notes,
            createdBy: userId,
          },
        });
      }

      if (dto.movementType === MovementType.TRANSFER) {
        if (!dto.fromWarehouseId || !dto.toWarehouseId) {
          throw new BadRequestException('fromWarehouseId and toWarehouseId are required');
        }

        if (dto.fromWarehouseId === dto.toWarehouseId) {
          throw new BadRequestException('Transfer source and destination cannot be the same');
        }

        await this.ensureWarehouseExists(tx, dto.fromWarehouseId);
        await this.ensureWarehouseExists(tx, dto.toWarehouseId);

        const fromStock = await tx.stock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: dto.fromWarehouseId,
              productId: dto.productId,
            },
          },
        });

        if (!fromStock || fromStock.quantity < dto.quantity) {
          throw new BadRequestException('Insufficient source stock');
        }

        await tx.stock.update({
          where: {
            warehouseId_productId: {
              warehouseId: dto.fromWarehouseId,
              productId: dto.productId,
            },
          },
          data: {
            quantity: { decrement: dto.quantity },
          },
        });

        await tx.stock.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: dto.toWarehouseId,
              productId: dto.productId,
            },
          },
          update: {
            quantity: { increment: dto.quantity },
          },
          create: {
            warehouseId: dto.toWarehouseId,
            productId: dto.productId,
            quantity: dto.quantity,
          },
        });

        return tx.stockMovement.create({
          data: {
            movementType: dto.movementType,
            productId: dto.productId,
            fromWarehouseId: dto.fromWarehouseId,
            toWarehouseId: dto.toWarehouseId,
            quantity: dto.quantity,
            notes: dto.notes,
            createdBy: userId,
          },
        });
      }

      throw new BadRequestException('Use opname endpoint for ADJUSTMENT movement');
    });

    this.realtime.emit('stocks.updated', {
      movementType: dto.movementType,
      productId: dto.productId,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      quantity: dto.quantity,
      createdBy: userId,
      createdAt: movement.createdAt,
    });

    return movement;
  }

  async performOpname(dto: StockOpnameDto, userId: string) {
    await this.ensureProductExists(dto.productId);

    const result = await this.prisma.$transaction(async (tx) => {
      await this.ensureWarehouseExists(tx, dto.warehouseId);

      const currentStock = await tx.stock.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
        update: {},
        create: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          quantity: 0,
        },
      });

      const difference = dto.actualQty - currentStock.quantity;

      const updatedStock = await tx.stock.update({
        where: {
          warehouseId_productId: {
            warehouseId: dto.warehouseId,
            productId: dto.productId,
          },
        },
        data: {
          quantity: dto.actualQty,
        },
      });

      const opname = await tx.stockOpname.create({
        data: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          systemQty: currentStock.quantity,
          actualQty: dto.actualQty,
          difference,
          reason: dto.reason,
          performedBy: userId,
        },
      });

      await tx.stockMovement.create({
        data: {
          movementType: MovementType.ADJUSTMENT,
          productId: dto.productId,
          fromWarehouseId: dto.warehouseId,
          toWarehouseId: dto.warehouseId,
          quantity: Math.abs(difference),
          referenceType: 'OPNAME',
          referenceId: opname.id,
          notes: dto.reason,
          createdBy: userId,
        },
      });

      return {
        opname,
        stock: updatedStock,
      };
    });

    this.realtime.emit('stocks.updated', {
      movementType: MovementType.ADJUSTMENT,
      productId: dto.productId,
      fromWarehouseId: dto.warehouseId,
      toWarehouseId: dto.warehouseId,
      quantity: Math.abs(result.opname.difference),
      referenceType: 'OPNAME',
      referenceId: result.opname.id,
      createdBy: userId,
      createdAt: result.opname.createdAt,
    });

    return result;
  }

  history(query: { warehouseId?: string; productId?: string; movementType?: MovementType }) {
    return this.prisma.stockMovement.findMany({
      where: {
        ...(query.warehouseId
          ? {
              OR: [{ fromWarehouseId: query.warehouseId }, { toWarehouseId: query.warehouseId }],
            }
          : {}),
        ...(query.productId ? { productId: query.productId } : {}),
        ...(query.movementType ? { movementType: query.movementType } : {}),
      },
      include: {
        product: true,
        fromWarehouse: true,
        toWarehouse: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async alerts() {
    const stocks = await this.prisma.stock.findMany({
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return stocks.filter((stock) => stock.quantity < stock.minStock);
  }

  async valuation() {
    const stocks = await this.prisma.stock.findMany({
      include: { product: true, warehouse: true },
    });

    const items = stocks.map((stock) => {
      const buyPrice = Number(stock.product.buyPrice);
      const value = buyPrice * stock.quantity;
      return {
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouse.name,
        productId: stock.productId,
        productName: stock.product.name,
        quantity: stock.quantity,
        buyPrice,
        value,
      };
    });

    return {
      totalValue: items.reduce((sum, item) => sum + item.value, 0),
      items,
    };
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async ensureWarehouseExists(tx: Prisma.TransactionClient, warehouseId: string) {
    const warehouse = await tx.warehouse.findFirst({ where: { id: warehouseId, deletedAt: null } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
  }
}
