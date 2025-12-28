import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { createMidtransTransaction } from '@/lib/midtrans';

import { verifyAuth, assertUserCanTransact } from '@/lib/auth';


/**
 * POST /api/payment/create
 * Create Midtrans payment for an order
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

        // Get order with all related data
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                address: {
                    select: {
                        recipientName: true,
                        phone: true,
                        fullAddress: true,
                        city: true,
                        postalCode: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify order ownership
        if (order.userId !== transactCheck.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized access to order' },
                { status: 403 }
            );
        }

        // Check if order is in valid state for payment
        if (order.status !== 'PENDING_PAYMENT') {
            return NextResponse.json(
                { error: `Order status must be PENDING_PAYMENT, current: ${order.status}` },
                { status: 400 }
            );
        }

        // ============================================================
        // P0 FIX #1: Stock Availability Pre-Check
        // Check current stock BEFORE creating payment
        // Prevents: User pays but order fails due to out of stock
        // ============================================================
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
                        error: `Variant produk tidak ditemukan`,
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
                        error: `Produk tidak ditemukan`,
                        stockIssue: true
                    }, { status: 400 });
                }

                currentStock = product.stock;
                productName = product.name;
            }

            // Check if stock is sufficient
            if (currentStock < item.quantity) {
                return NextResponse.json({
                    error: `Stok ${productName} tidak mencukupi. Tersedia: ${currentStock}, diminta: ${item.quantity}`,
                    stockIssue: true,
                    availableStock: currentStock,
                    requestedQuantity: item.quantity
                }, { status: 400 });
            }
        }

        // ============================================================
        // P0 FIX #2: Payment PENDING Duplicate Guard
        // If payment already PENDING, return existing transaction
        // Prevents: Multiple Midtrans transactions for same order
        // ============================================================
        const existingPayment = await prisma.payments.findUnique({
            where: { orderId: order.id },
        });

        if (existingPayment && existingPayment.status === 'SUCCESS') {
            return NextResponse.json(
                { error: 'Order sudah dibayar' },
                { status: 400 }
            );
        }

        if (existingPayment && existingPayment.status === 'PENDING') {
            // Return existing payment token instead of creating new one
            return NextResponse.json({
                message: 'Pembayaran sudah diproses, silakan lanjutkan pembayaran',
                token: existingPayment.gatewayTransactionId,
                redirectUrl: existingPayment.gatewayResponse?.redirect_url,
                duplicate: true
            }, { status: 200 });
        }

        // Transform order items to include productName
        const transformedOrder = {
            ...order,
            items: order.items.map(item => ({
                ...item,
                productName: item.product.name,
            })),
        };

        // Create Midtrans transaction
        const transaction = await createMidtransTransaction(transformedOrder);

        // Save or update payment record
        const payment = await prisma.payments.upsert({
            where: { orderId: order.id },
            update: {
                gatewayTransactionId: transaction.token,
                gatewayResponse: transaction,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                status: 'PENDING', // Transaction started, waiting for user to complete payment
            },
            create: {
                orderId: order.id,
                paymentMethod: 'midtrans',
                amount: order.total,
                status: 'PENDING', // Transaction started
                gatewayTransactionId: transaction.token,
                gatewayResponse: transaction,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        console.log('Payment created:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: order.total,
            token: transaction.token,
        });

        return NextResponse.json({
            success: true,
            token: transaction.token,
            redirectUrl: transaction.redirect_url,
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            {
                error: 'Gagal membuat pembayaran',
                details: error.message
            },
            { status: 500 }
        );
    }
}

