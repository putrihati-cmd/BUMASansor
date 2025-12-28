/**
 * Affiliate Withdrawal API
 * Request commission withdrawal
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { requireAuth } from '@/lib/auth';


/**
 * POST /api/affiliate/withdraw
 * Request withdrawal of affiliate commissions
 */
export const POST = requireAuth(async function POST(request, context) {
    try {
        const { amount, bankAccount } = await request.json();

        // Get affiliate info
        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: context.user.id }
        });

        if (!affiliate) {
            return NextResponse.json(
                { error: 'Not registered as affiliate' },
                { status: 404 }
            );
        }

        if (affiliate.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Affiliate account is not active' },
                { status: 403 }
            );
        }

        // Validate amount
        const withdrawAmount = parseFloat(amount);
        const minWithdraw = 100000; // Minimum 100k

        if (withdrawAmount < minWithdraw) {
            return NextResponse.json(
                { error: `Minimum withdrawal is Rp ${minWithdraw.toLocaleString()}` },
                { status: 400 }
            );
        }

        if (withdrawAmount > parseFloat(affiliate.availableBalance)) {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            );
        }

        // Create withdrawal request
        const withdrawal = await prisma.affiliateWithdrawal.create({
            data: {
                affiliateId: affiliate.id,
                amount: withdrawAmount,
                bankAccount: bankAccount || affiliate.bankAccount,
                status: 'PENDING'
            }
        });

        // Deduct from available balance
        await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
                availableBalance: {
                    decrement: withdrawAmount
                }
            }
        });

        return NextResponse.json({
            success: true,
            withdrawal: {
                id: withdrawal.id,
                amount: parseFloat(withdrawal.amount),
                status: withdrawal.status,
                createdAt: withdrawal.createdAt
            }
        });

    } catch (error) {
        console.error('[Affiliate Withdrawal] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process withdrawal', details: error.message },
            { status: 500 }
        );
    }
});

/**
 * GET /api/affiliate/withdraw
 * Get withdrawal history
 */
export const GET = requireAuth(async function GET(request, context) {
    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: context.user.id }
        });

        if (!affiliate) {
            return NextResponse.json(
                { error: 'Not registered as affiliate' },
                { status: 404 }
            );
        }

        const withdrawals = await prisma.affiliateWithdrawal.findMany({
            where: { affiliateId: affiliate.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({
            withdrawals: withdrawals.map(w => ({
                id: w.id,
                amount: parseFloat(w.amount),
                status: w.status,
                bankAccount: w.bankAccount,
                proofUrl: w.proofUrl,
                processedAt: w.processedAt,
                createdAt: w.createdAt
            }))
        });

    } catch (error) {
        console.error('[Affiliate Withdrawal History] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get withdrawal history', details: error.message },
            { status: 500 }
        );
    }
});

