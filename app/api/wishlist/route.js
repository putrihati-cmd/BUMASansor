/**
 * Wishlist API
 * Endpoints for managing user wishlist
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


/**
 * GET /api/wishlist
 * Get user's wishlist items
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

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: user.id },
            include: {
                product: {
                    include: {
                        category: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        console.error('[Wishlist GET] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/wishlist
 * Add product to wishlist
 * Body: { productId: string }
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
        const { productId } = body;

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

        // Check if already in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: user.id,
                    productId: productId
                }
            }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Already in wishlist' },
                { status: 400 }
            );
        }

        // Add to wishlist
        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: user.id,
                productId: productId
            },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: wishlistItem,
            message: 'Added to wishlist'
        }, { status: 201 });

    } catch (error) {
        console.error('[Wishlist POST] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/wishlist
 * Remove product from wishlist
 * Body: { productId: string }
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
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Product ID required' },
                { status: 400 }
            );
        }

        // Delete from wishlist
        const deleted = await prisma.wishlist.deleteMany({
            where: {
                userId: user.id,
                productId: productId
            }
        });

        if (deleted.count === 0) {
            return NextResponse.json(
                { success: false, error: 'Item not in wishlist' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Removed from wishlist'
        });

    } catch (error) {
        console.error('[Wishlist DELETE] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}

