import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


/**
 * Search autocomplete/suggestions
 * Returns quick suggestions for search input
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '5');

        if (query.length < 2) {
            return NextResponse.json({
                success: true,
                suggestions: [],
            });
        }

        // Get product suggestions
        const products = await prisma.products.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
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
            take: limit,
            orderBy: {
                isFeatured: 'desc',
            },
        });

        // Get category suggestions
        const categories = await prisma.categories.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            take: 3,
        });

        return NextResponse.json({
            success: true,
            suggestions: {
                products: products.map(p => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    image: p.images?.[0] || null,
                    price: Number(p.salePrice || p.basePrice),
                })),
                categories: categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    productCount: c._count.products,
                })),
            },
        });
    } catch (error) {
        console.error('Suggestions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suggestions' },
            { status: 500 }
        );
    }
}

