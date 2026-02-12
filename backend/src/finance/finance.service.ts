import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReceivableStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryReceivableDto } from './dto/query-receivable.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async listReceivables(query: QueryReceivableDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const now = new Date();
    const where = {
      deletedAt: null,
      ...(query.warungId ? { warungId: query.warungId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.overdueOnly ? { dueDate: { lt: now }, balance: { gt: 0 } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.receivable.findMany({
        where,
        include: {
          warung: true,
          payments: true,
        },
        orderBy: { dueDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.receivable.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const receivable = await this.prisma.receivable.findFirst({
      where: { id: dto.receivableId, deletedAt: null },
      include: { warung: true },
    });

    if (!receivable) {
      throw new NotFoundException('Receivable not found');
    }

    const currentBalance = Number(receivable.balance);
    if (currentBalance <= 0) {
      throw new BadRequestException('Receivable is already paid');
    }

    if (dto.amount > currentBalance) {
      throw new BadRequestException('Payment amount exceeds receivable balance');
    }

    const nextBalance = Number((currentBalance - dto.amount).toFixed(2));
    const nextPaid = Number((Number(receivable.paidAmount) + dto.amount).toFixed(2));

    let nextStatus: ReceivableStatus = ReceivableStatus.PARTIAL;
    if (nextBalance <= 0) {
      nextStatus = ReceivableStatus.PAID;
    } else if (receivable.dueDate < new Date()) {
      nextStatus = ReceivableStatus.OVERDUE;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          receivableId: receivable.id,
          amount: dto.amount,
          method: dto.method,
          proofUrl: dto.proofUrl,
          notes: dto.notes,
          verifiedBy: userId,
        },
      });

      const updatedReceivable = await tx.receivable.update({
        where: { id: receivable.id },
        data: {
          paidAmount: nextPaid,
          balance: Math.max(nextBalance, 0),
          status: nextStatus,
        },
      });

      await tx.warung.update({
        where: { id: receivable.warungId },
        data: {
          currentDebt: {
            decrement: dto.amount,
          },
        },
      });

      return {
        payment,
        receivable: updatedReceivable,
      };
    });

    await this.syncWarungBlocks();

    return result;
  }

  async receivableAging() {
    const receivables = await this.prisma.receivable.findMany({
      where: {
        deletedAt: null,
        balance: { gt: 0 },
      },
    });

    const today = new Date();
    const buckets = {
      current: 0,
      overdue1to30: 0,
      overdue31to60: 0,
      overdue61to90: 0,
      overdue90plus: 0,
    };

    for (const rec of receivables) {
      const balance = Number(rec.balance);
      const due = new Date(rec.dueDate).getTime();
      const diff = Math.floor((today.getTime() - due) / 86400000);

      if (diff <= 0) {
        buckets.current += balance;
      } else if (diff <= 30) {
        buckets.overdue1to30 += balance;
      } else if (diff <= 60) {
        buckets.overdue31to60 += balance;
      } else if (diff <= 90) {
        buckets.overdue61to90 += balance;
      } else {
        buckets.overdue90plus += balance;
      }
    }

    return {
      totalOutstanding: Object.values(buckets).reduce((sum, value) => sum + value, 0),
      buckets,
    };
  }

  async warungCreditStatus(warungId: string) {
    const warung = await this.prisma.warung.findFirst({ where: { id: warungId, deletedAt: null } });
    if (!warung) {
      throw new NotFoundException('Warung not found');
    }

    const receivableAggregate = await this.prisma.receivable.aggregate({
      where: {
        warungId,
        deletedAt: null,
        balance: { gt: 0 },
      },
      _sum: { balance: true },
    });

    const outstanding = Number(receivableAggregate._sum.balance ?? 0);
    const limit = Number(warung.creditLimit);

    return {
      warungId,
      creditLimit: limit,
      currentDebt: outstanding,
      availableCredit: limit - outstanding,
      isBlocked: warung.isBlocked,
      blockedReason: warung.blockedReason,
      creditDays: warung.creditDays,
    };
  }

  async refreshOverdueStatus() {
    const now = new Date();
    const result = await this.prisma.receivable.updateMany({
      where: {
        deletedAt: null,
        dueDate: { lt: now },
        balance: { gt: 0 },
        status: { in: [ReceivableStatus.UNPAID, ReceivableStatus.PARTIAL] },
      },
      data: { status: ReceivableStatus.OVERDUE },
    });

    const blocked = await this.syncWarungBlocks();

    return {
      updatedOverdue: result.count,
      blockedWarungs: blocked.blocked,
      unblockedWarungs: blocked.unblocked,
    };
  }

  private async syncWarungBlocks() {
    const now = new Date();
    const overdueList = await this.prisma.receivable.findMany({
      where: {
        deletedAt: null,
        status: ReceivableStatus.OVERDUE,
        balance: { gt: 0 },
      },
      select: {
        warungId: true,
        dueDate: true,
      },
    });

    const map = new Map<string, number>();
    for (const row of overdueList) {
      const overdueDays = Math.floor((now.getTime() - row.dueDate.getTime()) / 86400000);
      const current = map.get(row.warungId) ?? 0;
      if (overdueDays > current) {
        map.set(row.warungId, overdueDays);
      }
    }

    const over3Ids = Array.from(map.entries())
      .filter(([, days]) => days > 3)
      .map(([warungId]) => warungId);

    const [blockRes, unblockRes] = await this.prisma.$transaction([
      this.prisma.warung.updateMany({
        where: {
          id: { in: over3Ids },
          isBlocked: false,
        },
        data: {
          isBlocked: true,
          blockedReason: 'Auto blocked: overdue receivable > 3 days',
        },
      }),
      this.prisma.warung.updateMany({
        where: {
          id: { notIn: over3Ids },
          blockedReason: 'Auto blocked: overdue receivable > 3 days',
        },
        data: {
          isBlocked: false,
          blockedReason: null,
        },
      }),
    ]);

    return {
      blocked: blockRes.count,
      unblocked: unblockRes.count,
    };
  }
}
