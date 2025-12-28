import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';

import { slugify } from '@/lib/utils';


// GET /api/admin/flash-sales - Get all flash sales
export async function GET(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const flashSales = await prisma.flashSale.findMany({
            orderBy: { startTime: 'desc' },
            include: {
                products: {
                    include: {
                        product: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            flashSales: flashSales.map(fs => ({
                id: fs.id,
                name: fs.name,
                slug: fs.slug,
                bannerUrl: fs.bannerUrl,
                startTime: fs.startTime,
                endTime: fs.endTime,
                status: fs.status,
                productCount: fs.products.length,
                totalSold: fs.products.reduce((sum, p) => sum + p.soldCount, 0),
            })),
        });
    } catch (error) {
        console.error('List flash sales error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// POST /api/admin/flash-sales - Create new flash sale
export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, bannerUrl, startTime, endTime, products } = body;

        if (!name || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Nama, waktu mulai, dan waktu selesai wajib diisi' },
                { status: 400 }
            );
        }

        // Determine status based on times
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        let status = 'UPCOMING';
        if (now >= start && now <= end) status = 'ACTIVE';
        else if (now > end) status = 'ENDED';

        // Create flash sale
        const flashSale = await prisma.flashSale.create({
            data: {
                name,
                slug: slugify(name) + '-' + Date.now(),
                description,
                bannerUrl,
                startTime: start,
                endTime: end,
                status,
                products: products?.length > 0 ? {
                    create: products.map(p => ({
                        productId: p.productId,
                        salePrice: p.salePrice,
                        stockLimit: p.stockLimit,
                    })),
                } : undefined,
            },
        });

        return NextResponse.json({
            message: 'Flash sale berhasil dibuat',
            flashSale: { id: flashSale.id, name: flashSale.name },
        }, { status: 201 });
    } catch (error) {
        console.error('Create flash sale error:', error);
        return NextResponse.json({ error: 'Gagal membuat flash sale' }, { status: 500 });
    }
}

