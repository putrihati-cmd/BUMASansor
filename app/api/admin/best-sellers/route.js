import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { requireAuth } from '@/lib/auth';


export const GET = requireAuth(async function GET(request, context) {
    try {
        // Only admins can access
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Get best selling products
        const bestSellers = await prisma.order_items.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                subtotal: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        // Get product details
        const productIds = bestSellers.map(item => item.productId);
        const products = await prisma.products.findMany({
            where: {
                id: {
                    in: productIds,
                },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                basePrice: true,
                salePrice: true,
                stock: true,
            },
        });

        // Combine data
        const bestSellersWithDetails = bestSellers.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                name: product?.name || 'Unknown Product',
                slug: product?.slug,
                image: product?.images?.[0] || null,
                price: Number(product?.salePrice || product?.basePrice || 0),
                stock: product?.stock || 0,
                totalSold: item._sum.quantity || 0,
                totalRevenue: Number(item._sum.subtotal || 0),
                orderCount: item._count.id,
            };
        });

        return NextResponse.json({
            success: true,
            bestSellers: bestSellersWithDetails,
        });
    } catch (error) {
        console.error('Best sellers error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch best sellers' },
            { status: 500 }
        );
    }
});

