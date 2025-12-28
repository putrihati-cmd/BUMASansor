/**
 * COD (Cash on Delivery) Payment API
 * Handle COD payment confirmation
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth, assertUserCanTransact } from '@/lib/auth';


/**
 * POST /api/payment/cod
 * Confirm COD payment for an order
 * Body: { orderId: string }
 */
export async function POST(request) {
    try {
        // ROLE BOUNDARY CHECK - Block ADMIN/SYSTEM from transactions
        const transactCheck = await assertUserCanTransact(request);
        if (!transactCheck.canTransact) {
            return NextResponse.json({ error: transactCheck.error }, { status: 403 });
        }

        // Must be authenticated for payment
        if (transactCheck.isGuest) {
            return NextResponse.json(
                { error: 'Authentication required for payment' },
                { status: 401 }
            );
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID required' },
                { status: 400 }
            );
        }

        // Get order
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (order.userId !== transactCheck.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Check if order is in valid state
        if (order.status !== 'PENDING_PAYMENT') {
            return NextResponse.json(
                { error: `Order must be in PENDING_PAYMENT status, current: ${order.status}` },
                { status: 400 }
            );
        }

        // Stock check (same as Midtrans)
        for (const item of order.items) {
            let currentStock = 0;
            let productName = '';

            if (item.variantId) {
                const variant = await prisma.product_variants.findUnique({
                    where: { id: item.variantId },
                    include: { product: true }
                });

                if (!variant) {
                    return NextResponse.json({
                        error: 'Product variant not found',
                        stockIssue: true
                    }, { status: 400 });
                }

                currentStock = variant.stock;
                productName = `${variant.product.name} - ${variant.name}`;
            } else {
                const product = await prisma.products.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    return NextResponse.json({
                        error: 'Product not found',
                        stockIssue: true
                    }, { status: 400 });
                }

                currentStock = product.stock;
                productName = product.name;
            }

            if (currentStock < item.quantity) {
                return NextResponse.json({
                    error: `Stock ${productName} insufficient. Available: ${currentStock}, requested: ${item.quantity}`,
                    stockIssue: true,
                    availableStock: currentStock,
                    requestedQuantity: item.quantity
                }, { status: 400 });
            }
        }

        // Create COD payment record
        const payment = await prisma.payments.create({
            data: {
                orderId: order.id,
                paymentMethod: 'COD',
                amount: order.total,
                status: 'PENDING', // COD is pending until delivery confirmed
            }
        });

        // Update order status to PROCESSING
        await prisma.orders.update({
            where: { id: orderId },
            data: {
                status: 'PROCESSING',
                paymentMethod: 'COD'
            }
        });

        // TODO: Send WhatsApp notification for COD order
        // await sendWhatsAppNotification({
        //     type: 'COD_ORDER_CONFIRMED',
        //     orderId: order.id,
        //     orderNumber: order.orderNumber
        // });

        return NextResponse.json({
            success: true,
            message: 'COD order confirmed. Payment will be collected upon delivery.',
            payment: {
                id: payment.id,
                method: 'COD',
                amount: payment.amount,
                status: payment.status
            },
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: 'PROCESSING'
            }
        });

    } catch (error) {
        console.error('[COD Payment] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process COD payment',
                details: error.message
            },
            { status: 500 }
        );
    }
}

