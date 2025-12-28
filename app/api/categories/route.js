import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


// GET /api/categories - Get all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        const categoriesWithCount = categories.map((cat) => ({
            ...cat,
            productCount: cat._count.products,
        }));

        return NextResponse.json({ categories: categoriesWithCount });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data kategori' },
            { status: 500 }
        );
    }
}

