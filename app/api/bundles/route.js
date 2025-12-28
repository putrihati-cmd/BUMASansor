import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


/**
 * GET active bundles
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const limit = parseInt(searchParams.get('limit') || '10');

        const now = new Date();

        // Build where clause
        const where = {
            isActive: true,
            OR: [
                { validFrom: null, validUntil: null },
                {
                    validFrom: { lte: now },
                    validUntil: { gte: now },
                },
            ],
        };

        // If productId provided, find bundles containing that product
        if (productId) {
            where.products = {
                some: {
                    productId,
                },
            };
        }

        const bundles = await prisma.bundles.findMany({
            where,
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                images: true,
                                basePrice: true,
                                salePrice: true,
                                stock: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        // Calculate bundle prices and savings
        const bundlesWithPricing = bundles.map((bundle) => {
            // Calculate original total price
            const originalTotal = bundle.products.reduce((sum, bp) => {
                const price = Number(bp.product.salePrice || bp.product.basePrice);
                return sum + price * bp.quantity;
            }, 0);

            // Calculate discount
            let discount = 0;
            if (bundle.discountType === 'PERCENTAGE') {
                discount = (originalTotal * Number(bundle.discountValue)) / 100;
            } else {
                discount = Number(bundle.discountValue);
            }

            const bundlePrice = originalTotal - discount;
            const savingsPercentage = Math.round((discount / originalTotal) * 100);

            // Check if all products in stock
            const allInStock = bundle.products.every(
                (bp) => bp.product.stock >= bp.quantity
            );

            return {
                id: bundle.id,
                name: bundle.name,
                slug: bundle.slug,
                description: bundle.description,
                imageUrl: bundle.imageUrl,
                minQuantity: bundle.minQuantity,
                discountType: bundle.discountType,
                discountValue: Number(bundle.discountValue),
                validFrom: bundle.validFrom,
                validUntil: bundle.validUntil,
                products: bundle.products.map((bp) => ({
                    ...bp.product,
                    quantity: bp.quantity,
                    price: Number(bp.product.salePrice || bp.product.basePrice),
                })),
                pricing: {
                    originalTotal: Math.round(originalTotal),
                    bundlePrice: Math.round(bundlePrice),
                    savings: Math.round(discount),
                    savingsPercentage,
                },
                allInStock,
            };
        });

        return NextResponse.json({
            success: true,
            bundles: bundlesWithPricing,
        });
    } catch (error) {
        console.error('Bundles fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bundles' },
            { status: 500 }
        );
    }
}

