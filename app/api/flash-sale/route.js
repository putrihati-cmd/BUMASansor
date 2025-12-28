import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


// GET /api/flash-sale - Get active flash sale with products
export async function GET() {
    try {
        const now = new Date();

        // Get current active flash sale
        const flashSale = await prisma.flash_sales.findFirst({
            where: {
                startTime: { lte: now },
                endTime: { gte: now },
                status: 'ACTIVE',
            },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                basePrice: true,
                                images: true,
                                stock: true,
                            },
                        },
                    },
                },
            },
        });

        if (!flashSale) {
            // Get upcoming flash sale
            const upcomingFlashSale = await prisma.flash_sales.findFirst({
                where: {
                    startTime: { gt: now },
                    status: 'UPCOMING',
                },
                orderBy: { startTime: 'asc' },
            });

            return NextResponse.json({
                active: false,
                upcoming: upcomingFlashSale ? {
                    id: upcomingFlashSale.id,
                    name: upcomingFlashSale.name,
                    startTime: upcomingFlashSale.startTime,
                } : null,
                products: [],
            });
        }

        // Format response
        const products = flashSale.products.map(fp => ({
            id: fp.product.id,
            name: fp.product.name,
            slug: fp.product.slug,
            image: fp.product.images?.[0] || null,
            originalPrice: Number(fp.product.basePrice),
            salePrice: Number(fp.salePrice),
            discountPercent: Math.round((1 - Number(fp.salePrice) / Number(fp.product.basePrice)) * 100),
            stockLimit: fp.stockLimit,
            soldCount: fp.soldCount,
            stockLeft: fp.stockLimit - fp.soldCount,
        }));

        return NextResponse.json({
            active: true,
            flashSale: {
                id: flashSale.id,
                name: flashSale.name,
                slug: flashSale.slug,
                bannerUrl: flashSale.bannerUrl,
                startTime: flashSale.startTime,
                endTime: flashSale.endTime,
            },
            products,
        });
    } catch (error) {
        console.error('Flash sale error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data flash sale' },
            { status: 500 }
        );
    }
}

