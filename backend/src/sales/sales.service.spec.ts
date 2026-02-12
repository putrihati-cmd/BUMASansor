import { Test } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = moduleRef.get(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
