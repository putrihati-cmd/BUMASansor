import { Injectable } from '@nestjs/common';
import { OrderStatus, POStatus, ReceivableStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) { }

  async dashboard() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const [
      salesToday,
      unpaidReceivables,
      activeWarungs,
      blockedWarungs,
      stocks,
      topProducts,
      profitEstimate,
      collectedToday,
      chart,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { createdAt: { gte: start, lte: end }, deletedAt: null },
        _sum: { totalAmount: true, paidAmount: true },
        _count: true,
      }),
      this.prisma.receivable.aggregate({
        where: {
          deletedAt: null,
          status: {
            in: [ReceivableStatus.UNPAID, ReceivableStatus.PARTIAL, ReceivableStatus.OVERDUE],
          },
        },
        _sum: { balance: true },
      }),
      this.prisma.warung.count({ where: { deletedAt: null, isBlocked: false } }),
      this.prisma.warung.count({ where: { deletedAt: null, isBlocked: true } }),
      this.prisma.stock.findMany({ include: { product: true } }),
      this.topProducts(30, 5),
      this.profitEstimate(start, end),
      this.collectedPayments(start, end),
      this.monthlyChart(12),
    ]);

    const lowStockCount = stocks.filter((stock: any) => stock.quantity < stock.minStock).length;
    const stockValue = stocks.reduce(
      (sum: number, stock: any) => sum + stock.quantity * Number(stock.product.basePrice),
      0,
    );

    const cashIn = Number(salesToday._sum.paidAmount ?? 0);
    const kasBank = cashIn + collectedToday;

    return {
      today: {
        transactions: salesToday._count,
        omzet: Number(salesToday._sum.totalAmount ?? 0),
        cashIn,
        receivableIncrease:
          Number(salesToday._sum.totalAmount ?? 0) - Number(salesToday._sum.paidAmount ?? 0),
        profitEstimate,
        kasBank,
      },
      receivables: {
        outstanding: Number(unpaidReceivables._sum.balance ?? 0),
      },
      warungs: {
        active: activeWarungs,
        blocked: blockedWarungs,
      },
      stocks: {
        lowStockCount,
        totalValue: stockValue,
      },
      topProducts,
      chart,
    };
  }

  private async profitEstimate(start: Date, end: Date) {
    const items = await this.prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: start, lte: end },
          deletedAt: null,
        },
      },
    });

    return items.reduce((sum, item) => {
      const revenue = Number(item.subtotal); // subtotal is already quantity * (price - discount)
      const cost = Number(item.costPrice) * item.quantity;
      return sum + (revenue - cost);
    }, 0);
  }

  private async collectedPayments(start: Date, end: Date) {
    const result = await this.prisma.payment.aggregate({
      where: {
        paymentDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    return Number(result._sum.amount ?? 0);
  }

  private async monthlyChart(monthCount = 12) {
    const now = new Date();
    const months = Array.from({ length: monthCount }).map((_, index) => {
      const offset = monthCount - 1 - index;
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
      return { label, start, end };
    });

    const results = await Promise.all(
      months.map(async (month) => {
        const [sales, purchases] = await Promise.all([
          this.prisma.sale.aggregate({
            where: { createdAt: { gte: month.start, lte: month.end }, deletedAt: null },
            _sum: { totalAmount: true },
          }),
          this.prisma.purchaseOrder.aggregate({
            where: {
              deletedAt: null,
              status: POStatus.RECEIVED,
              receivedAt: { gte: month.start, lte: month.end },
            },
            _sum: { totalAmount: true },
          }),
        ]);

        return {
          label: month.label,
          omzet: Number(sales._sum.totalAmount ?? 0),
          pengeluaran: Number(purchases._sum.totalAmount ?? 0),
        };
      }),
    );

    return {
      omzetBulanan: {
        labels: results.map((row) => row.label),
        omzet: results.map((row) => row.omzet),
        pengeluaran: results.map((row) => row.pengeluaran),
      },
    };
  }

  async daily(date?: string) {
    const target = date ? new Date(date) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const [sales, payments] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { createdAt: { gte: start, lte: end }, deletedAt: null },
        _sum: { totalAmount: true, paidAmount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { paymentDate: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      date: start.toISOString().slice(0, 10),
      sales: {
        transactions: sales._count,
        omzet: Number(sales._sum.totalAmount ?? 0),
        paid: Number(sales._sum.paidAmount ?? 0),
      },
      payments: {
        count: payments._count,
        collected: Number(payments._sum.amount ?? 0),
      },
    };
  }

  async monthly(month?: string) {
    const base = month
      ? new Date(`${month}-01`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);

    const [sales, receivables, payments] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { createdAt: { gte: start, lte: end }, deletedAt: null },
        _sum: { totalAmount: true, paidAmount: true },
        _count: true,
      }),
      this.prisma.receivable.aggregate({
        where: { createdAt: { gte: start, lte: end }, deletedAt: null },
        _sum: { amount: true, balance: true },
      }),
      this.prisma.payment.aggregate({
        where: { paymentDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    return {
      period: `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`,
      sales: {
        transactions: sales._count,
        omzet: Number(sales._sum.totalAmount ?? 0),
        paid: Number(sales._sum.paidAmount ?? 0),
      },
      receivables: {
        created: Number(receivables._sum.amount ?? 0),
        outstanding: Number(receivables._sum.balance ?? 0),
      },
      collections: {
        amount: Number(payments._sum.amount ?? 0),
      },
    };
  }

  async topProducts(days = 30, top = 10) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const items = await this.prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: since },
          deletedAt: null,
        },
      },
      include: {
        warungProduct: {
          include: {
            product: true,
          },
        },
      },
    });

    const groupedMap = new Map<string, { quantitySold: number; revenue: number; name: string; barcode: string }>();

    for (const item of items) {
      const productId = item.warungProduct.productId;
      const current = groupedMap.get(productId) || { quantitySold: 0, revenue: 0, name: item.warungProduct.product.name, barcode: item.warungProduct.product.barcode };
      current.quantitySold += item.quantity;
      current.revenue += Number(item.subtotal);
      groupedMap.set(productId, current);
    }

    const result = Array.from(groupedMap.entries())
      .map(([productId, data]) => ({
        productId,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, top);

    return result.map((row, index) => ({
      rank: index + 1,
      ...row,
    }));
  }

  async warungPerformance(period = 'monthly') {
    const since = new Date();
    if (period === 'weekly') {
      since.setDate(since.getDate() - 7);
    } else {
      since.setMonth(since.getMonth() - 1);
    }

    const warungs = await this.prisma.warung.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        isBlocked: true,
        currentDebt: true,
      },
    });

    const result = [];

    for (const warung of warungs) {
      const [sales, payments] = await Promise.all([
        this.prisma.sale.aggregate({
          where: {
            warungId: warung.id,
            createdAt: { gte: since },
            deletedAt: null,
          },
          _count: true,
          _sum: { totalAmount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            receivable: { warungId: warung.id },
            paymentDate: { gte: since },
          },
          _sum: { amount: true },
        }),
      ]);

      const totalPurchase = Number(sales._sum.totalAmount ?? 0);
      const totalPayment = Number(payments._sum.amount ?? 0);
      const currentDebt = Number(warung.currentDebt);

      let paymentScore = 100;
      if (totalPurchase > 0) {
        paymentScore = Math.max(0, Math.min(100, Math.round((totalPayment / totalPurchase) * 100)));
      }

      result.push({
        warungId: warung.id,
        warungName: warung.name,
        totalOrders: sales._count,
        totalPurchase,
        totalPayment,
        currentDebt,
        paymentScore,
        status: warung.isBlocked ? 'BLOCKED' : 'ACTIVE',
      });
    }

    return {
      period,
      warungs: result.sort((a, b) => b.totalPurchase - a.totalPurchase),
    };
  }
}
