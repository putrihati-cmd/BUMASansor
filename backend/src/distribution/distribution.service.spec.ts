import { Test } from '@nestjs/testing';
import { DistributionService } from './distribution.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DistributionService', () => {
  let service: DistributionService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DistributionService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = moduleRef.get(DistributionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
