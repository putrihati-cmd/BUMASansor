/**
 * Stock Notification API
 * Subscribe to stock availability notifications
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


/**
 * POST /api/stock-notification
 * Subscribe to stock notification for out-of-stock product
 * Body: { productId: string, variantId?: string }
 */
export async function POST(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, variantId } = body;

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Product ID required' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if variant exists (if provided)
        if (variantId) {
            const variant = await prisma.productVariant.findUnique({
                where: { id: variantId }
            });

            if (!variant) {
                return NextResponse.json(
                    { success: false, error: 'Variant not found' },
                    { status: 404 }
                );
            }
        }

        // Check if already subscribed
        const existing = await prisma.stockNotification.findFirst({
            where: {
                userId: user.id,
                productId: productId,
                variantId: variantId || null,
                notified: false
            }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Already subscribed to stock notification' },
                { status: 400 }
            );
        }

        // Create notification subscription
        const notification = await prisma.stockNotification.create({
            data: {
                userId: user.id,
                productId: productId,
                variantId: variantId || null
            },
            include: {
                product: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'You will be notified when the product is back in stock',
            data: notification
        }, { status: 201 });

    } catch (error) {
        console.error('[Stock Notification POST] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to subscribe to stock notification' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/stock-notification
 * Get user's stock notification subscriptions
 */
export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const notifications = await prisma.stockNotification.findMany({
            where: {
                userId: user.id,
                notified: false
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        stock: true
                    }
                },
                variant: {
                    select: {
                        id: true,
                        name: true,
                        stock: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('[Stock Notification GET] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/stock-notification?id=xxx
 * Unsubscribe from stock notification
 */
export async function DELETE(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Notification ID required' },
                { status: 400 }
            );
        }

        // Delete notification
        const deleted = await prisma.stockNotification.deleteMany({
            where: {
                id: id,
                userId: user.id
            }
        });

        if (deleted.count === 0) {
            return NextResponse.json(
                { success: false, error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Unsubscribed from stock notification'
        });

    } catch (error) {
        console.error('[Stock Notification DELETE] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}

