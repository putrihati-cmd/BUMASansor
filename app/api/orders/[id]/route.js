import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/orders/[id] - Get single order
export async function GET(request, { params }) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.user;

        const { id } = await params;

        const order = await prisma.orders.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, images: true, slug: true },
                        },
                    },
                },
                address: true,
                payment: true,
                shipment: true,
                refund: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
    }
}

// PUT /api/orders/[id] - Cancel order (only if pending)
export async function PUT(request, { params }) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.user;

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        const order = await prisma.orders.findFirst({
            where: { id, userId: user.id },
            include: { items: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        if (action === 'cancel') {
            if (order.status !== 'PENDING_PAYMENT') {
                return NextResponse.json({
                    error: 'Pesanan tidak dapat dibatalkan karena sudah diproses'
                }, { status: 400 });
            }

            // Cancel order and restore stock
            await prisma.$transaction(async (tx) => {
                // Update order status
                await tx.order.update({
                    where: { id },
                    data: { status: 'CANCELLED' },
                });

                // Update payment status
                await tx.payment.updateMany({
                    where: { orderId: id },
                    data: { status: 'FAILED' },
                });

                // Restore stock
                for (const item of order.items) {
                    if (item.variantId) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { increment: item.quantity } },
                        });
                    } else {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } },
                        });
                    }
                }
            });

            return NextResponse.json({ message: 'Pesanan berhasil dibatalkan' });
        }

        if (action === 'complete') {
            if (order.status !== 'DELIVERED') {
                return NextResponse.json({
                    error: 'Pesanan belum diterima'
                }, { status: 400 });
            }

            await prisma.orders.update({
                where: { id },
                data: { status: 'COMPLETED' },
            });

            return NextResponse.json({ message: 'Pesanan selesai. Terima kasih!' });
        }

        return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Gagal mengupdate pesanan' }, { status: 500 });
    }
}
