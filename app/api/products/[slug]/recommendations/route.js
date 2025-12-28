import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const { slug } = resolvedParams;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '8');

        // Find the product
        const product = await prisma.products.findUnique({
            where: { slug },
            select: {
                id: true,
                categoryId: true,
                basePrice: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Get recommendations in parallel
        const [relatedProducts, alsoBought, recentlyViewed] = await Promise.all([
            // 1. Related products (same category)
            prisma.products.findMany({
                where: {
                    categoryId: product.categoryId,
                    id: { not: product.id },
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                    basePrice: true,
                    salePrice: true,
                    _count: {
                        select: { reviews: true },
                    },
                },
                orderBy: {
                    isFeatured: 'desc',
                },
                take: limit,
            }),

            // 2. Customers also bought (based on order items)
            prisma.$queryRaw`
                SELECT DISTINCT p.id, p.name, p.slug, p.images, p.base_price, p.sale_price
                FROM products p
                INNER JOIN order_items oi ON p.id = oi.product_id
                INNER JOIN orders o ON oi.order_id = o.id
                WHERE o.id IN (
                    SELECT DISTINCT o2.id
                    FROM orders o2
                    INNER JOIN order_items oi2 ON o2.id = oi2.order_id
                    WHERE oi2.product_id = ${product.id}::uuid
                    AND o2.status IN ('PAID', 'COMPLETED', 'DELIVERED')
                )
                AND p.id != ${product.id}::uuid
                AND p.status = 'ACTIVE'
                LIMIT ${limit}
            `,

            // 3. Similar price range
            prisma.products.findMany({
                where: {
                    id: { not: product.id },
                    status: 'ACTIVE',
                    OR: [
                        {
                            basePrice: {
                                gte: Number(product.basePrice) * 0.7,
                                lte: Number(product.basePrice) * 1.3,
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                    basePrice: true,
                    salePrice: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit,
            }),
        ]);

        // Format products
        const formatProduct = (p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            image: Array.isArray(p.images) ? p.images[0] : p.images,
            basePrice: Number(p.base_price || p.basePrice),
            salePrice: p.sale_price || p.salePrice ? Number(p.sale_price || p.salePrice) : null,
        });

        return NextResponse.json({
            success: true,
            recommendations: {
                relatedProducts: relatedProducts.map(formatProduct),
                alsoBought: alsoBought.map(formatProduct),
                similarPrice: recentlyViewed.map(formatProduct),
            },
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}
