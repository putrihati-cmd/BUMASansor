
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming this is where prisma client is exported

export async function GET() {
    try {
        const banners = await prisma.banners.findMany({
            where: {
                is_active: true,
            },
            orderBy: {
                order: 'asc',
            },
        });

        return NextResponse.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}
