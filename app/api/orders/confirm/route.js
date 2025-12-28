import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


/**
 * POST /api/orders/confirm
 * Confirm order receipt (Pesanan Diterima)
 */
export async function POST(request) {
    try {
        // Verify authentication
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID diperlukan' },
                { status: 400 }
            );
        }

        // Get order
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (order.userId !== auth.user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Verify status (must be SHIPPED)
        if (order.status !== 'SHIPPED') {
            return NextResponse.json(
                {
                    error: 'Hanya pesanan dalam pengiriman yang bisa dikonfirmasi',
                    currentStatus: order.status
                },
                { status: 400 }
            );
        }

        // Update status to COMPLETED
        const updatedOrder = await prisma.orders.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                // You might want to extend the schema to better track this
                // completedAt: new Date() 
            }
        });

        console.log(`✅ Order ${order.orderNumber} confirmed by user`);

        return NextResponse.json({
            success: true,
            message: 'Pesanan berhasil dikonfirmasi sebagai diterima',
            order: updatedOrder
        });

    } catch (error) {
        console.error('Confirm order error:', error);
        return NextResponse.json(
            { error: 'Gagal mengkonfirmasi pesanan' },
            { status: 500 }
        );
    }
}

