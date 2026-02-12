import { Injectable } from '@nestjs/common';
import { ReceivableStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const [salesToday, unpaidReceivables, activeWarungs, blockedWarungs, stocks, topProducts] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { createdAt: { gte: start, lte: end }, deletedAt: null },
        _sum: { totalAmount: true, paidAmount: true },
        _count: true,
      }),
      this.prisma.receivable.aggregate({
        where: {
          deletedAt: null,
          status: { in: [ReceivableStatus.UNPAID, ReceivableStatus.PARTIAL, ReceivableStatus.OVERDUE] },
        },
        _sum: { balance: true },
      }),
      this.prisma.warung.count({ where: { deletedAt: null, isBlocked: false } }),
      this.prisma.warung.count({ where: { deletedAt: null, isBlocked: true } }),
      this.prisma.stock.findMany({ include: { product: true } }),
      this.topProducts(30, 5),
    ]);

    const lowStockCount = stocks.filter((stock) => stock.quantity < stock.minStock).length;
    const stockValue = stocks.reduce((sum, stock) => sum + stock.quantity * Number(stock.product.buyPrice), 0);

    return {
      today: {
        transactions: salesToday._count,
        omzet: Number(salesToday._sum.totalAmount ?? 0),
        cashIn: Number(salesToday._sum.paidAmount ?? 0),
        receivableIncrease:
          Number(salesToday._sum.totalAmount ?? 0) - Number(salesToday._sum.paidAmount ?? 0),
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
    const base = month ? new Date(`${month}-01`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
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

    const grouped = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          createdAt: { gte: since },
          deletedAt: null,
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          subtotal: 'desc',
        },
      },
      take: top,
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: grouped.map((row) => row.productId) } },
      select: { id: true, name: true, barcode: true },
    });

    return grouped.map((row, index) => ({
      rank: index + 1,
      productId: row.productId,
      productName: products.find((product) => product.id === row.productId)?.name ?? 'Unknown',
      barcode: products.find((product) => product.id === row.productId)?.barcode ?? '-',
      quantitySold: Number(row._sum.quantity ?? 0),
      revenue: Number(row._sum.subtotal ?? 0),
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
      },
    });

    const result = [];

    for (const warung of warungs) {
      const receivables = await this.prisma.receivable.findMany({
        where: {
          warungId: warung.id,
          deletedAt: null,
        },
        select: { id: true, balance: true },
      });

      const receivableIds = receivables.map((item) => item.id);

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
        receivableIds.length > 0
          ? this.prisma.payment.aggregate({
              where: {
                receivableId: { in: receivableIds },
                paymentDate: { gte: since },
              },
              _sum: { amount: true },
            })
          : Promise.resolve({ _sum: { amount: 0 } }),
      ]);

      const totalPurchase = Number(sales._sum.totalAmount ?? 0);
      const totalPayment = Number(payments._sum.amount ?? 0);
      const currentDebt = receivables.reduce((sum, item) => sum + Number(item.balance), 0);

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
