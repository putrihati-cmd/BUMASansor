import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { trackWaybill } from '@/lib/rajaongkir';

import { verifyAuth } from '@/lib/auth';


/**
 * POST /api/tracking
 * Track shipment status
 */
export async function POST(request) {
    try {
        // Verify authentication
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { waybill, courier } = body;

        if (!waybill || !courier) {
            return NextResponse.json(
                { error: 'Waybill dan courier diperlukan' },
                { status: 400 }
            );
        }

        if (waybill === '-') {
            return NextResponse.json(
                { error: 'Nomor resi belum tersedia' },
                { status: 400 }
            );
        }

        const result = await trackWaybill(waybill, courier);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Tracking API error:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal melacak pengiriman' },
            { status: 500 }
        );
    }
}

