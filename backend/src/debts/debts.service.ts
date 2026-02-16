import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceivableStatus } from '@prisma/client';

@Injectable()
export class DebtsService {
    constructor(private readonly prisma: PrismaService) { }

    async list(warungId: string, query: { status?: ReceivableStatus; customerId?: string; search?: string }) {
        return this.prisma.customerDebt.findMany({
            where: {
                warungId,
                ...(query.status ? { status: query.status } : {}),
                ...(query.customerId ? { customerId: query.customerId } : {}),
                ...(query.search ? {
                    customer: {
                        name: { contains: query.search, mode: 'insensitive' },
                    },
                } : {}),
                deletedAt: null,
            },
            include: {
                customer: true,
                sale: {
                    include: {
                        items: {
                            include: {
                                warungProduct: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                        },
                    },
                },
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getOne(id: string) {
        const debt = await this.prisma.customerDebt.findUnique({
            where: { id, deletedAt: null },
            include: {
                customer: true,
                sale: {
                    include: {
                        items: {
                            include: {
                                warungProduct: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                        },
                    },
                },
                payments: true,
            },
        });

        if (!debt) throw new NotFoundException('Debt record not found');
        return debt;
    }

    async pay(id: string, amount: number, method: any, notes?: string) {
        const debt = await this.getOne(id);
        const balance = Number(debt.balance);

        if (amount > balance) {
            throw new BadRequestException('Payment amount exceeds remaining balance');
        }

        const newBalance = balance - amount;
        const newPaidAmount = Number(debt.paidAmount) + amount;
        let status: ReceivableStatus = ReceivableStatus.PARTIAL;

        if (newBalance <= 0) {
            status = ReceivableStatus.PAID;
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Create payment record
            await tx.customerDebtPayment.create({
                data: {
                    debtId: id,
                    amount,
                    method,
                    notes,
                },
            });

            // 2. Update debt record
            const updatedDebt = await tx.customerDebt.update({
                where: { id },
                data: {
                    paidAmount: newPaidAmount,
                    balance: newBalance,
                    status,
                },
            });

            // 3. Update customer total debt
            await tx.customer.update({
                where: { id: debt.customerId },
                data: {
                    currentDebt: { decrement: amount },
                },
            });

            return updatedDebt;
        });
    }

    async createManual(warungId: string, customerId: string, amount: number, dueDate: Date, notes?: string) {
        return this.prisma.$transaction(async (tx) => {
            const debt = await tx.customerDebt.create({
                data: {
                    warungId,
                    customerId,
                    amount,
                    balance: amount,
                    status: ReceivableStatus.UNPAID,
                    dueDate,
                    notes,
                },
            });

            await tx.customer.update({
                where: { id: customerId },
                data: {
                    currentDebt: { increment: amount },
                },
            });

            return debt;
        });
    }
}
