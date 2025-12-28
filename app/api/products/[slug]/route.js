import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[slug] - Get single product by slug
export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        const product = await prisma.products.findUnique({
            where: { slug },
            include: {
                categories: {
                    select: { id: true, name: true, slug: true },
                },
                variants: {
                    orderBy: { name: 'asc' },
                },
                reviews: {
                    where: { status: 'APPROVED' },
                    include: {
                        users: {
                            select: { id: true, name: true, avatar_url: true },
                        },
                    },
                    orderBy: { created_at: 'desc' },
                    take: 10,
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Produk tidak ditemukan' },
                { status: 404 }
            );
        }

        // Get average rating
        const avgRating = await prisma.reviews.aggregate({
            where: { product_id: product.id, status: 'APPROVED' },
            _avg: { rating: true },
            _count: { rating: true },
        });

        // Get related products
        const relatedProducts = await prisma.products.findMany({
            where: {
                category_id: product.category_id,
                id: { not: product.id },
                status: 'ACTIVE',
            },
            take: 4,
            include: {
                categories: {
                    select: { name: true, slug: true },
                },
            },
        });

        return NextResponse.json({
            product: {
                ...product,
                base_price: Number(product.base_price),
                sale_price: product.sale_price ? Number(product.sale_price) : null,
                rating: avgRating._avg.rating || 0,
                reviewCount: avgRating._count.rating,
            },
            relatedProducts: relatedProducts.map(p => ({
                ...p,
                base_price: Number(p.base_price),
                sale_price: p.sale_price ? Number(p.sale_price) : null,
            })),
        });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data produk' },
            { status: 500 }
        );
    }
}
