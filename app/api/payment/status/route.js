import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { requireAuth } from '@/lib/auth';


export const GET = requireAuth(async function GET(request, context) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID required' },
                { status: 400 }
            );
        }

        // Get payment with order
        const payment = await prisma.payments.findUnique({
            where: { orderId },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        userId: true,
                        status: true,
                        total: true,
                    },
                },
            },
        });

        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (payment.order.userId !== context.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            payment: {
                id: payment.id,
                orderNumber: payment.order.orderNumber,
                amount: payment.amount,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                paidAt: payment.paidAt,
                expiresAt: payment.expiresAt,
                createdAt: payment.createdAt,
            },
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        return NextResponse.json(
            { error: 'Failed to get payment status' },
            { status: 500 }
        );
    }
});

