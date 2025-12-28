import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


/**
 * GET active flash sales with products
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeUpcoming = searchParams.get('includeUpcoming') === 'true';
        const limit = parseInt(searchParams.get('limit') || '10');

        const now = new Date();

        // Build where clause
        const where = includeUpcoming
            ? {
                OR: [
                    { status: 'ACTIVE' },
                    {
                        status: 'UPCOMING',
                        startTime: { lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) }, // within 24h
                    },
                ],
            }
            : {
                status: 'ACTIVE',
                startTime: { lte: now },
                endTime: { gte: now },
            };

        const flashSales = await prisma.flashSale.findMany({
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
                    orderBy: {
                        soldCount: 'desc',
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
            take: limit,
        });

        // Calculate time remaining and discount percentage
        const flashSalesWithMeta = flashSales.map((sale) => {
            const timeRemaining = new Date(sale.endTime).getTime() - now.getTime();
            const isExpired = timeRemaining <= 0;

            const productsWithDiscount = sale.products.map((fp) => {
                const originalPrice = Number(fp.product.salePrice || fp.product.basePrice);
                const discountPercentage = Math.round(
                    ((originalPrice - Number(fp.salePrice)) / originalPrice) * 100
                );
                const stockRemaining = fp.stockLimit - fp.soldCount;
                const stockPercentage = Math.round((stockRemaining / fp.stockLimit) * 100);

                return {
                    ...fp.product,
                    flashSalePrice: Number(fp.salePrice),
                    originalPrice,
                    discountPercentage,
                    stockLimit: fp.stockLimit,
                    soldCount: fp.soldCount,
                    stockRemaining,
                    stockPercentage,
                    isAlmostGone: stockPercentage <= 20,
                };
            });

            return {
                id: sale.id,
                name: sale.name,
                slug: sale.slug,
                description: sale.description,
                bannerUrl: sale.bannerUrl,
                startTime: sale.startTime,
                endTime: sale.endTime,
                status: isExpired ? 'ENDED' : sale.status,
                timeRemaining: Math.max(0, timeRemaining),
                products: productsWithDiscount,
            };
        });

        return NextResponse.json({
            success: true,
            flashSales: flashSalesWithMeta,
        });
    } catch (error) {
        console.error('Flash sales fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch flash sales' },
            { status: 500 }
        );
    }
}

