/**
 * Product Comparison API
 * Endpoints for comparing multiple products
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';


/**
 * GET /api/compare?ids=id1,id2,id3
 * Compare multiple products (max 4)
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids');

        if (!idsParam) {
            return NextResponse.json(
                { success: false, error: 'Product IDs required' },
                { status: 400 }
            );
        }

        const ids = idsParam.split(',').filter(id => id.trim());

        if (ids.length < 2) {
            return NextResponse.json(
                { success: false, error: 'At least 2 products required for comparison' },
                { status: 400 }
            );
        }

        if (ids.length > 4) {
            return NextResponse.json(
                { success: false, error: 'Maximum 4 products can be compared' },
                { status: 400 }
            );
        }

        // Fetch products
        const products = await prisma.products.findMany({
            where: {
                id: { in: ids }
            },
            include: {
                category: true,
                variants: true,
                reviews: {
                    select: {
                        rating: true
                    }
                }
            }
        });

        if (products.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No products found' },
                { status: 404 }
            );
        }

        // Calculate average ratings
        const productsWithRatings = products.map(product => {
            const ratings = product.reviews.map(r => r.rating);
            const avgRating = ratings.length > 0
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : 0;

            return {
                ...product,
                averageRating: avgRating,
                reviewCount: ratings.length,
                reviews: undefined // Remove detailed reviews
            };
        });

        // Build comparison matrix
        const comparison = {
            products: productsWithRatings,
            fields: [
                { label: 'Name', key: 'name' },
                { label: 'Category', key: 'category.name' },
                { label: 'Price', key: 'price' },
                { label: 'Rating', key: 'averageRating' },
                { label: 'Reviews', key: 'reviewCount' },
                { label: 'Stock', key: 'stock' },
                { label: 'Weight', key: 'weight' },
                { label: 'Variants', key: 'variants.length' },
            ]
        };

        return NextResponse.json({
            success: true,
            data: comparison
        });

    } catch (error) {
        console.error('[Compare GET] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to compare products' },
            { status: 500 }
        );
    }
}

