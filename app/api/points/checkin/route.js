import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Check-in rewards
const DAILY_CHECKIN_POINTS = 10;
const STREAK_BONUS_DAY = 7; // Bonus on day 7
const STREAK_BONUS_POINTS = 20; // Extra points on streak day

/**
 * GET /api/points/checkin
 * Get today's check-in status
 */
export const GET = requireAuth(async function GET(request, context) {
    try {
        const userId = context.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const todayCheckin = await prisma.point_transactions.findFirst({
            where: {
                userId,
                type: 'CHECKIN',
                createdAt: { gte: today }
            }
        });

        // Get streak info (consecutive days)
        const recentCheckins = await prisma.point_transactions.findMany({
            where: {
                userId,
                type: 'CHECKIN',
            },
            orderBy: { createdAt: 'desc' },
            take: 7
        });

        // Calculate streak
        let streak = 0;
        const now = new Date();

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(now);
            checkDate.setDate(checkDate.getDate() - i);
            checkDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(checkDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const hasCheckin = recentCheckins.some(c => {
                const checkinDate = new Date(c.createdAt);
                return checkinDate >= checkDate && checkinDate < nextDay;
            });

            if (hasCheckin) {
                streak++;
            } else if (i > 0) {
                // Break streak if missed a day (except today)
                break;
            }
        }

        return NextResponse.json({
            success: true,
            checkedInToday: !!todayCheckin,
            streak,
            dailyPoints: DAILY_CHECKIN_POINTS,
            nextBonusDay: STREAK_BONUS_DAY,
            bonusPoints: STREAK_BONUS_POINTS,
        });

    } catch (error) {
        console.error('Get checkin status error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil status check-in' },
            { status: 500 }
        );
    }
});

/**
 * POST /api/points/checkin
 * Daily check-in to earn points
 */
export const POST = requireAuth(async function POST(request, context) {
    try {
        const userId = context.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existingCheckin = await prisma.point_transactions.findFirst({
            where: {
                userId,
                type: 'CHECKIN',
                createdAt: { gte: today }
            }
        });

        if (existingCheckin) {
            return NextResponse.json(
                { success: false, error: 'Anda sudah check-in hari ini' },
                { status: 400 }
            );
        }

        // Calculate streak (check yesterday)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayCheckin = await prisma.point_transactions.findFirst({
            where: {
                userId,
                type: 'CHECKIN',
                createdAt: {
                    gte: yesterday,
                    lt: today
                }
            }
        });

        // Get current streak count
        let currentStreak = 1; // Today counts as 1

        if (yesterdayCheckin) {
            // Count consecutive days
            const recentCheckins = await prisma.point_transactions.findMany({
                where: {
                    userId,
                    type: 'CHECKIN',
                    createdAt: { lt: today }
                },
                orderBy: { createdAt: 'desc' },
                take: 7
            });

            for (let i = 0; i < recentCheckins.length; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(checkDate.getDate() - (i + 1));
                checkDate.setHours(0, 0, 0, 0);

                const nextDay = new Date(checkDate);
                nextDay.setDate(nextDay.getDate() + 1);

                const hasCheckin = recentCheckins.some(c => {
                    const cd = new Date(c.createdAt);
                    return cd >= checkDate && cd < nextDay;
                });

                if (hasCheckin) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // Calculate points (base + streak bonus)
        let pointsToAdd = DAILY_CHECKIN_POINTS;
        let bonusMessage = '';

        if (currentStreak > 0 && currentStreak % STREAK_BONUS_DAY === 0) {
            pointsToAdd += STREAK_BONUS_POINTS;
            bonusMessage = ` + Bonus streak hari ke-${currentStreak}!`;
        }

        // Transaction: add points
        await prisma.$transaction(async (tx) => {
            // Upsert user points
            await tx.userPoints.upsert({
                where: { userId },
                create: { userId, points: pointsToAdd },
                update: { points: { increment: pointsToAdd } }
            });

            // Log transaction
            await tx.pointTransaction.create({
                data: {
                    userId,
                    points: pointsToAdd,
                    type: 'CHECKIN',
                    description: `Daily check-in (streak: ${currentStreak} hari)${bonusMessage}`,
                }
            });
        });

        // Get new balance
        const userPoints = await prisma.user_points.findUnique({
            where: { userId }
        });

        return NextResponse.json({
            success: true,
            message: `Check-in berhasil! +${pointsToAdd} koin${bonusMessage}`,
            pointsEarned: pointsToAdd,
            streak: currentStreak,
            newBalance: userPoints?.points || pointsToAdd
        });

    } catch (error) {
        console.error('Daily checkin error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal check-in' },
            { status: 500 }
        );
    }
});

