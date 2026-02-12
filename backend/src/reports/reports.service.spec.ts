import { Test } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = moduleRef.get(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
