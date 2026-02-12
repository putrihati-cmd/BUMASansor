import { Test } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FinanceService', () => {
  let service: FinanceService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: PrismaService,
          useValue: {
            receivable: {
              updateMany: jest.fn().mockResolvedValue({ count: 0 }),
              findMany: jest.fn().mockResolvedValue([]),
            },
            warung: {
              updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
            $transaction: jest
              .fn()
              .mockImplementation((actions: unknown[]) => Promise.all(actions as Promise<unknown>[])),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(FinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
