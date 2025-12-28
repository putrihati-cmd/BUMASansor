import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[slug] - Get single product by slug
export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        const product = await prisma.products.findUnique({
            where: { slug },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                variants: {
                    orderBy: { name: 'asc' },
                },
                reviews: {
                    where: { status: 'APPROVED' },
                    include: {
                        user: {
                            select: { id: true, name: true, avatarUrl: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
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
            where: { productId: product.id, status: 'APPROVED' },
            _avg: { rating: true },
            _count: { rating: true },
        });

        // Get related products
        const relatedProducts = await prisma.products.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id },
                status: 'ACTIVE',
            },
            take: 4,
            include: {
                category: {
                    select: { name: true, slug: true },
                },
            },
        });

        return NextResponse.json({
            product: {
                ...product,
                rating: avgRating._avg.rating || 0,
                reviewCount: avgRating._count.rating,
            },
            relatedProducts,
        });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data produk' },
            { status: 500 }
        );
    }
}
