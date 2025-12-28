import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Daftar voucher yang bisa ditukar dengan koin
const REDEEM_OPTIONS = [
    { id: 1, name: 'Diskon Rp 10.000', coins: 100, value: 10000, type: 'FIXED' },
    { id: 2, name: 'Diskon Rp 25.000', coins: 200, value: 25000, type: 'FIXED' },
    { id: 3, name: 'Diskon Rp 50.000', coins: 400, value: 50000, type: 'FIXED' },
    { id: 4, name: 'Diskon 10%', coins: 150, value: 10, type: 'PERCENTAGE', maxDiscount: 50000 },
    { id: 5, name: 'Gratis Ongkir', coins: 100, value: 0, type: 'FREE_SHIPPING', maxDiscount: 30000 },
];

/**
 * POST /api/points/redeem
 * Tukar koin dengan voucher
 */
export const POST = requireAuth(async function POST(request, context) {
    try {
        const { optionId } = await request.json();
        const userId = context.user.id;

        // Validate option
        const option = REDEEM_OPTIONS.find(o => o.id === optionId);
        if (!option) {
            return NextResponse.json(
                { success: false, error: 'Opsi tidak valid' },
                { status: 400 }
            );
        }

        // Get user points
        const userPoints = await prisma.user_points.findUnique({
            where: { userId }
        });

        const currentBalance = userPoints?.points || 0;

        if (currentBalance < option.coins) {
            return NextResponse.json(
                { success: false, error: 'Koin tidak cukup' },
                { status: 400 }
            );
        }

        // Generate unique voucher code
        const voucherCode = `COIN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Calculate expiry (30 days from now)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);

        // Transaction: deduct points + create voucher
        const result = await prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.userPoints.update({
                where: { userId },
                data: { points: { decrement: option.coins } }
            });

            // Create voucher
            const voucher = await tx.voucher.create({
                data: {
                    code: voucherCode,
                    name: option.name,
                    type: option.type,
                    value: option.value,
                    minPurchase: 0,
                    maxDiscount: option.maxDiscount || option.value,
                    usageLimit: 1,
                    usedCount: 0,
                    validFrom: new Date(),
                    validUntil: validUntil,
                    isActive: true,
                    // Link to specific user
                    // Note: If your schema supports user-specific vouchers, add userId here
                }
            });

            // Log transaction
            await tx.pointTransaction.create({
                data: {
                    userId,
                    points: -option.coins,
                    type: 'REDEEM',
                    description: `Tukar dengan ${option.name}`,
                }
            });

            return voucher;
        });

        return NextResponse.json({
            success: true,
            message: 'Berhasil menukar koin!',
            voucher: {
                code: result.code,
                name: result.name,
                validUntil: result.validUntil,
            },
            newBalance: currentBalance - option.coins
        });

    } catch (error) {
        console.error('Redeem points error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menukar koin' },
            { status: 500 }
        );
    }
});

