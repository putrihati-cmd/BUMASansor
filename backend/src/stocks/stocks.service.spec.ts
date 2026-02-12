import { Test } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StocksService', () => {
  let service: StocksService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: PrismaService,
          useValue: {
            stock: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(StocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
