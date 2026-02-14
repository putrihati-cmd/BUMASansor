import { BadRequestException } from '@nestjs/common';
import { DistributionService } from './distribution.service';

describe('DistributionService', () => {
  let service: DistributionService;
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
        findFirst: jest.fn(),
      },
      deliveryOrder: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      receivable: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      stock: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
      purchaseOrder: {
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (arg: any) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      return arg(prisma);
    });

    realtime = { emit: jest.fn() };
    service = new DistributionService(prisma, realtime);
  });

  describe('createDeliveryOrder', () => {
    it('throws when warung is blocked', async () => {
      prisma.warung.findFirst.mockResolvedValue({
        id: 'w-1',
        isBlocked: true,
        blockedReason: 'overdue',
        creditLimit: 1000,
        currentDebt: 0,
        creditDays: 14,
      });

      await expect(
        service.createDeliveryOrder('admin-1', {
          warungId: 'w-1',
          warehouseId: 'wh-1',
          items: [{ productId: 'p-1', quantity: 1, price: 10 }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when credit limit exceeded', async () => {
      prisma.warung.findFirst.mockResolvedValue({
        id: 'w-1',
        isBlocked: false,
        creditLimit: 100,
        currentDebt: 90,
        creditDays: 14,
      });
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'wh-1' });
      prisma.product.findMany.mockResolvedValue([{ id: 'p-1' }]);

      await expect(
        service.createDeliveryOrder('admin-1', {
          warungId: 'w-1',
          warehouseId: 'wh-1',
          items: [{ productId: 'p-1', quantity: 2, price: 10 }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('confirmDelivery', () => {
    it('throws when already confirmed (receivable exists)', async () => {
      prisma.deliveryOrder.findFirst.mockResolvedValue({
        id: 'do-1',
        status: 'DELIVERED',
        warehouseId: 'wh-1',
        warungId: 'w-1',
        dueDate: new Date('2026-01-01'),
        totalAmount: 100,
        doNumber: 'DO-1',
        items: [{ productId: 'p-1', quantity: 1 }],
      });
      prisma.receivable.findFirst.mockResolvedValue({ id: 'rec-1' });

      await expect(service.confirmDelivery('do-1', 'admin-1', { photoProof: 'x' } as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws when stock insufficient', async () => {
      prisma.deliveryOrder.findFirst.mockResolvedValue({
        id: 'do-1',
        status: 'DELIVERED',
        warehouseId: 'wh-1',
        warungId: 'w-1',
        dueDate: new Date('2026-01-01'),
        totalAmount: 100,
        doNumber: 'DO-1',
        items: [{ productId: 'p-1', quantity: 5 }],
      });
      prisma.receivable.findFirst.mockResolvedValue(null);

      prisma.stock.findUnique.mockResolvedValue({ quantity: 1 });

      await expect(service.confirmDelivery('do-1', 'admin-1', { photoProof: 'x' } as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('assignKurir', () => {
    it('throws when kurir not found', async () => {
      prisma.deliveryOrder.findFirst.mockResolvedValue({ id: 'do-1', status: 'PENDING' });
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.assignKurir('do-1', { kurirId: 'k-1' } as any)).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
