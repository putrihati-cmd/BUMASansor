import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinanceService } from './finance.service';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: any;
  let realtime: any;

  beforeEach(() => {
    prisma = {
      receivable: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        aggregate: jest.fn(),
        count: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        aggregate: jest.fn(),
      },
      warung: {
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
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
    service = new FinanceService(prisma, realtime);
  });

  describe('createPayment', () => {
    it('throws NotFoundException when receivable not found', async () => {
      prisma.receivable.findFirst.mockResolvedValue(null);

      await expect(
        service.createPayment('admin-1', {
          receivableId: 'rec-1',
          amount: 100,
          method: 'CASH',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when amount exceeds balance', async () => {
      prisma.receivable.findFirst.mockResolvedValue({
        id: 'rec-1',
        warungId: 'w-1',
        balance: 100,
        paidAmount: 0,
        dueDate: new Date('2026-01-01'),
        warung: { id: 'w-1' },
      });

      await expect(
        service.createPayment('admin-1', {
          receivableId: 'rec-1',
          amount: 200,
          method: 'TRANSFER',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates receivable and warung debt on success', async () => {
      prisma.receivable.findFirst.mockResolvedValue({
        id: 'rec-1',
        warungId: 'w-1',
        balance: 100,
        paidAmount: 0,
        dueDate: new Date('2026-01-01'),
        warung: { id: 'w-1' },
      });

      prisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      prisma.receivable.update.mockResolvedValue({ id: 'rec-1', balance: 0, paidAmount: 100, status: 'PAID' });
      prisma.warung.update.mockResolvedValue({ id: 'w-1' });

      prisma.receivable.findMany.mockResolvedValue([]);
      prisma.warung.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.createPayment('admin-1', {
        receivableId: 'rec-1',
        amount: 100,
        method: 'TRANSFER',
      } as any);

      expect(prisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ receivableId: 'rec-1', amount: 100, method: 'TRANSFER', verifiedBy: 'admin-1' }),
        }),
      );

      expect(prisma.warung.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'w-1' },
          data: { currentDebt: { decrement: 100 } },
        }),
      );

      expect(result).toHaveProperty('payment');
      expect(result).toHaveProperty('receivable');
    });
  });
});
