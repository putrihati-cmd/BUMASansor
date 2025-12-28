/**
 * API: Sales Trend
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { analyticsService } from '@/lib/analyticsService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const auth = await verifyAuth(request);

        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days')) || 30;

        const trend = await analyticsService.getSalesTrend(days);

        return NextResponse.json({
            success: true,
            data: trend
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

