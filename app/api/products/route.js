import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


// GET /api/products - Get all products with filters
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'newest';
        const featured = searchParams.get('featured');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        // Build where clause
        const where = {
            status: 'ACTIVE',
        };

        if (category) {
            where.category = { slug: category };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (featured === 'true') {
            where.isFeatured = true;
        }

        if (minPrice || maxPrice) {
            where.basePrice = {};
            if (minPrice) where.basePrice.gte = parseFloat(minPrice);
            if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
        }

        // Build orderBy
        let orderBy = {};
        switch (sort) {
            case 'price-low':
                orderBy = { basePrice: 'asc' };
                break;
            case 'price-high':
                orderBy = { basePrice: 'desc' };
                break;
            case 'name':
                orderBy = { name: 'asc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }

        // Get products with pagination
        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    _count: {
                        select: { reviews: true },
                    },
                },
            }),
            prisma.products.count({ where }),
        ]);

        // Calculate average ratings
        const productsWithRating = await Promise.all(
            products.map(async (product) => {
                const avgRating = await prisma.reviews.aggregate({
                    where: { productId: product.id, status: 'APPROVED' },
                    _avg: { rating: true },
                });
                return {
                    ...product,
                    rating: avgRating._avg.rating || 0,
                    reviewCount: product._count.reviews,
                };
            })
        );

        return NextResponse.json({
            products: productsWithRating,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data produk' },
            { status: 500 }
        );
    }
}

