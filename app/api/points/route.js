import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


// Points configuration
const POINTS_CONFIG = {
    EARN_RATE: 100, // 1 point per Rp100 spent
    MIN_REDEEM: 1000, // Minimum points to redeem
    POINT_VALUE: 100, // 1 point = Rp100 discount
    DAILY_CHECKIN: 10, // Points for daily check-in
    REVIEW_BONUS: 50, // Points for writing review
    ORDER_BONUS: 20, // Bonus points per order completed
};

// GET /api/points - Get user points balance and history
export async function GET(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 10;

        // Get or create user points
        let userPoints = await prisma.user_points.findUnique({
            where: { userId: auth.user.id },
        });

        if (!userPoints) {
            userPoints = await prisma.user_points.create({
                data: { userId: auth.user.id, balance: 0, lifetime: 0 },
            });
        }

        // Get transaction history
        const transactions = await prisma.point_transactions.findMany({
            where: { userId: auth.user.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // Check if user already did daily check-in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCheckin = await prisma.point_transactions.findFirst({
            where: {
                userId: auth.user.id,
                type: 'EARN_DAILY',
                createdAt: { gte: today },
            },
        });

        return NextResponse.json({
            balance: userPoints.balance,
            lifetime: userPoints.lifetime,
            value: userPoints.balance * POINTS_CONFIG.POINT_VALUE,
            canCheckin: !todayCheckin,
            config: POINTS_CONFIG,
            transactions: transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                balance: t.balance,
                description: t.description,
                createdAt: t.createdAt,
            })),
        });
    } catch (error) {
        console.error('Get points error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data poin' }, { status: 500 });
    }
}

// POST /api/points - Actions like daily check-in, redeem
export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, amount } = body;

        // Get current balance
        let userPoints = await prisma.user_points.findUnique({
            where: { userId: auth.user.id },
        });

        if (!userPoints) {
            userPoints = await prisma.user_points.create({
                data: { userId: auth.user.id, balance: 0, lifetime: 0 },
            });
        }

        if (action === 'DAILY_CHECKIN') {
            // Check if already checked in today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayCheckin = await prisma.point_transactions.findFirst({
                where: {
                    userId: auth.user.id,
                    type: 'EARN_DAILY',
                    createdAt: { gte: today },
                },
            });

            if (todayCheckin) {
                return NextResponse.json(
                    { error: 'Anda sudah check-in hari ini' },
                    { status: 400 }
                );
            }

            const earnAmount = POINTS_CONFIG.DAILY_CHECKIN;
            const newBalance = userPoints.balance + earnAmount;

            // Transaction
            await prisma.$transaction([
                prisma.user_points.update({
                    where: { userId: auth.user.id },
                    data: {
                        balance: newBalance,
                        lifetime: { increment: earnAmount },
                    },
                }),
                prisma.point_transactions.create({
                    data: {
                        userId: auth.user.id,
                        type: 'EARN_DAILY',
                        amount: earnAmount,
                        balance: newBalance,
                        description: 'Daily check-in bonus',
                    },
                }),
            ]);

            return NextResponse.json({
                message: `Selamat! Anda mendapat ${earnAmount} poin`,
                earned: earnAmount,
                balance: newBalance,
            });
        }

        if (action === 'REDEEM') {
            if (!amount || amount < POINTS_CONFIG.MIN_REDEEM) {
                return NextResponse.json(
                    { error: `Minimum redeem ${POINTS_CONFIG.MIN_REDEEM} poin` },
                    { status: 400 }
                );
            }

            if (userPoints.balance < amount) {
                return NextResponse.json(
                    { error: 'Poin tidak mencukupi' },
                    { status: 400 }
                );
            }

            const newBalance = userPoints.balance - amount;
            const discountValue = amount * POINTS_CONFIG.POINT_VALUE;

            // This just marks the intention - actual discount applied at checkout
            return NextResponse.json({
                success: true,
                pointsUsed: amount,
                discountValue,
                newBalance,
            });
        }

        return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
    } catch (error) {
        console.error('Points action error:', error);
        return NextResponse.json({ error: 'Gagal memproses' }, { status: 500 });
    }
}

