import { NextResponse } from 'next/server';
import { getProvinces } from '@/lib/rajaongkir';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const provinces = await getProvinces();

        return NextResponse.json({
            success: true,
            provinces,
        });
    } catch (error) {
        console.error('Get provinces error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provinces', details: error.message },
            { status: 500 }
        );
    }
}

