/**
 * API: Inventory Alerts
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

        const alerts = await analyticsService.getInventoryAlerts();

        return NextResponse.json({
            success: true,
            data: alerts
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

