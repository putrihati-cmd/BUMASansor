import { BadRequestException } from '@nestjs/common';
import { StocksService } from './stocks.service';

describe('StocksService', () => {
  let service: StocksService;
  let prisma: any;
  let realtime: any;

  beforeEach(() => {
    prisma = {
      product: {
        findFirst: jest.fn(),
      },
      stock: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      warehouse: {
        findFirst: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      stockOpname: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));

    realtime = { emit: jest.fn() };
    service = new StocksService(prisma, realtime);
  });

  describe('recordMovement', () => {
    it('throws when IN movement missing toWarehouseId', async () => {
      prisma.product.findFirst.mockResolvedValue({ id: 'p-1' });

      await expect(
        service.recordMovement(
          {
            movementType: 'IN',
            productId: 'p-1',
            quantity: 1,
          } as any,
          'u-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when OUT movement insufficient stock', async () => {
      prisma.product.findFirst.mockResolvedValue({ id: 'p-1' });
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1' });
      prisma.stock.findUnique.mockResolvedValue({ quantity: 0 });

      await expect(
        service.recordMovement(
          {
            movementType: 'OUT',
            productId: 'p-1',
            fromWarehouseId: 'wh-1',
            quantity: 10,
          } as any,
          'u-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('performOpname', () => {
    it('records opname and adjustment movement', async () => {
      prisma.product.findFirst.mockResolvedValue({ id: 'p-1' });
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1' });

      prisma.stock.upsert.mockResolvedValue({ warehouseId: 'wh-1', productId: 'p-1', quantity: 5 });
      prisma.stock.update.mockResolvedValue({ warehouseId: 'wh-1', productId: 'p-1', quantity: 8 });
      prisma.stockOpname.create.mockResolvedValue({ id: 'op-1' });
      prisma.stockMovement.create.mockResolvedValue({ id: 'mv-1' });

      const result = await service.performOpname(
        {
          warehouseId: 'wh-1',
          productId: 'p-1',
          actualQty: 8,
          reason: 'count',
        } as any,
        'u-1',
      );

      expect(prisma.stock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { quantity: 8 },
        }),
      );

      expect(prisma.stockOpname.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ systemQty: 5, actualQty: 8, difference: 3, reason: 'count', performedBy: 'u-1' }),
        }),
      );

      expect(prisma.stockMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ movementType: 'ADJUSTMENT', quantity: 3, referenceType: 'OPNAME', referenceId: 'op-1' }),
        }),
      );

      expect(result).toHaveProperty('opname');
      expect(result).toHaveProperty('stock');
    });
  });
});
