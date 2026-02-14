import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      sale: {
        aggregate: jest.fn(),
      },
      receivable: {
        aggregate: jest.fn(),
        findMany: jest.fn(),
      },
      warung: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      stock: {
        findMany: jest.fn(),
      },
      saleItem: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
      payment: {
        aggregate: jest.fn(),
      },
      purchaseOrder: {
        aggregate: jest.fn(),
      },
    };

    service = new ReportsService(prisma);
  });

  describe('dashboard', () => {
    it('returns expected dashboard shape', async () => {
      prisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: 1000, paidAmount: 800 },
        _count: 2,
      });
      prisma.receivable.aggregate.mockResolvedValue({ _sum: { balance: 200 } });
      prisma.warung.count.mockResolvedValueOnce(5).mockResolvedValueOnce(1);

      prisma.stock.findMany.mockResolvedValue([
        { quantity: 1, minStock: 10, product: { buyPrice: 100 } },
        { quantity: 20, minStock: 10, product: { buyPrice: 50 } },
      ]);

      prisma.saleItem.groupBy.mockResolvedValue([
        { productId: 'p-1', _sum: { quantity: 10, subtotal: 500 } },
      ]);
      prisma.product.findMany.mockResolvedValue([{ id: 'p-1', name: 'P1', barcode: 'B1' }]);
      prisma.saleItem.findMany.mockResolvedValue([
        { quantity: 2, price: 10, product: { buyPrice: 7 } },
      ]);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 50 }, _count: 1 });
      prisma.purchaseOrder.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });

      const result = await service.dashboard();

      expect(result).toHaveProperty('today');
      expect(result).toHaveProperty('receivables');
      expect(result).toHaveProperty('warungs');
      expect(result).toHaveProperty('stocks');
      expect(result).toHaveProperty('topProducts');

      expect(result.today.omzet).toBe(1000);
      expect(result.today.cashIn).toBe(800);
      expect(result.today.profitEstimate).toBe(6);
      expect(result.receivables.outstanding).toBe(200);
      expect(result.warungs.active).toBe(5);
      expect(result.warungs.blocked).toBe(1);
      expect(result.stocks.lowStockCount).toBe(1);
    });
  });
});
