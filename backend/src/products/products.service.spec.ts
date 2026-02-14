import { BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (arr: any[]) => Promise.all(arr));

    service = new ProductsService(prisma);
  });

  describe('create', () => {
    it('throws when category not found', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'P',
          categoryId: 'cat-1',
          buyPrice: 100,
          sellPrice: 150,
          unit: 'pcs',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('calculates margin and uses provided barcode', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 'cat-1' });
      prisma.product.create.mockResolvedValue({ id: 'p-1' });

      await service.create({
        name: 'P',
        barcode: 'B-1',
        categoryId: 'cat-1',
        buyPrice: 100,
        sellPrice: 150,
        unit: 'pcs',
      } as any);

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ barcode: 'B-1', margin: 50 }),
        }),
      );
    });
  });
});
