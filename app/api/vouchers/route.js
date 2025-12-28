import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/vouchers - Get all vouchers
export async function GET(request) {
    try {
        const vouchers = await prisma.voucher.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            vouchers: vouchers.map(v => ({
                id: v.id,
                code: v.code,
                name: v.code, // Use code as name if no name field
                type: v.type,
                value: Number(v.value),
                minPurchase: Number(v.minPurchase || 0),
                maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : null,
                usageLimit: v.usageLimit,
                usedCount: v.usedCount || 0,
                validFrom: v.validFrom,
                validUntil: v.validUntil,
                status: v.status,
                isActive: v.status === 'ACTIVE',
            })),
        });
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/vouchers - Create new voucher
export async function POST(request) {
    try {
        const body = await request.json();

        const voucher = await prisma.voucher.create({
            data: {
                code: body.code.toUpperCase(),
                type: body.type || 'PERCENTAGE',
                value: body.value,
                minPurchase: body.minPurchase || 0,
                maxDiscount: body.maxDiscount || null,
                usageLimit: body.usageLimit || null,
                validFrom: new Date(body.validFrom),
                validUntil: new Date(body.validUntil),
                status: body.status || 'ACTIVE',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Voucher berhasil dibuat',
            voucher,
        });
    } catch (error) {
        console.error('Error creating voucher:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

