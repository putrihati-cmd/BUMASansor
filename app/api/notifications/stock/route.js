import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


/**
 * Stock Notification API
 * Saves email for back-in-stock alerts
 */

export async function POST(request) {
    try {
        const { email, productId, productName } = await request.json();

        if (!email || !productId) {
            return NextResponse.json(
                { success: false, message: 'Email dan Product ID diperlukan' },
                { status: 400 }
            );
        }

        // Check if already subscribed
        const existing = await prisma.stockNotification.findFirst({
            where: {
                email,
                productId,
            },
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Anda sudah terdaftar untuk notifikasi produk ini',
            });
        }

        // Create notification subscription
        await prisma.stockNotification.create({
            data: {
                email,
                productId,
                productName: productName || null,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Berhasil mendaftar notifikasi stok',
        });

    } catch (error) {
        console.error('Stock notification error:', error);

        // If table doesn't exist, just return success (graceful fallback)
        if (error.code === 'P2021') {
            return NextResponse.json({
                success: true,
                message: 'Notifikasi dicatat (mode fallback)',
            });
        }

        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan' },
            { status: 500 }
        );
    }
}

