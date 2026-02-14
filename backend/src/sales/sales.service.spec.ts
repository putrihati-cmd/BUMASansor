import { BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;
  let prisma: any;
  let realtime: any;

  beforeEach(() => {
    prisma = {
      warung: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      warehouse: {
        findFirst: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
      stock: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
      },
      sale: {
        create: jest.fn(),
        count: jest.fn(),
      },
      receivable: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));

    realtime = { emit: jest.fn() };
    service = new SalesService(prisma, realtime);
  });

  describe('create', () => {
    it('throws when warung is blocked', async () => {
      prisma.warung.findFirst.mockResolvedValue({
        id: 'w-1',
        isBlocked: true,
        blockedReason: 'overdue',
      });

      await expect(
        service.create('u-1', {
          warungId: 'w-1',
          warehouseId: 'wh-1',
          paymentMethod: 'CASH',
          items: [{ productId: 'p-1', quantity: 1 }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when paidAmount > totalAmount', async () => {
      prisma.warung.findFirst.mockResolvedValue({ id: 'w-1', isBlocked: false, creditDays: 14 });
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1' });
      prisma.product.findMany.mockResolvedValue([{ id: 'p-1', sellPrice: 100, deletedAt: null }]);

      await expect(
        service.create('u-1', {
          warungId: 'w-1',
          warehouseId: 'wh-1',
          paymentMethod: 'CASH',
          paidAmount: 999,
          items: [{ productId: 'p-1', quantity: 1 }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when stock insufficient', async () => {
      prisma.warung.findFirst.mockResolvedValue({ id: 'w-1', isBlocked: false, creditDays: 14 });
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1' });
      prisma.product.findMany.mockResolvedValue([{ id: 'p-1', sellPrice: 100, deletedAt: null }]);

      prisma.stock.findUnique.mockResolvedValue({ quantity: 0 });

      await expect(
        service.create('u-1', {
          warungId: 'w-1',
          warehouseId: 'wh-1',
          paymentMethod: 'CASH',
          items: [{ productId: 'p-1', quantity: 1 }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
