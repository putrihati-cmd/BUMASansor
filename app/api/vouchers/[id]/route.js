import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/vouchers/[id] - Get single voucher
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const voucher = await prisma.vouchers.findUnique({
            where: { id },
        });

        if (!voucher) {
            return NextResponse.json(
                { success: false, error: 'Voucher tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            voucher: {
                ...voucher,
                value: Number(voucher.value),
                minPurchase: Number(voucher.minPurchase || 0),
                maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
            },
        });
    } catch (error) {
        console.error('Error fetching voucher:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/vouchers/[id] - Update voucher
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const voucher = await prisma.vouchers.update({
            where: { id },
            data: {
                code: body.code?.toUpperCase(),
                type: body.type,
                value: body.value,
                minPurchase: body.minPurchase,
                maxDiscount: body.maxDiscount,
                usageLimit: body.usageLimit,
                validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
                validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
                status: body.status,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Voucher berhasil diupdate',
            voucher,
        });
    } catch (error) {
        console.error('Error updating voucher:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/vouchers/[id] - Delete voucher
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        await prisma.vouchers.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Voucher berhasil dihapus',
        });
    } catch (error) {
        console.error('Error deleting voucher:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
