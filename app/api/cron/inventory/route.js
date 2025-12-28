/**
 * CRON ENDPOINT - Inventory Jobs
 * 
 * Endpoint: GET /api/cron/inventory
 * 
 * Triggers inventory management jobs:
 * - Release expired reservations
 * - Reconcile stock
 * - Low stock alerts
 * 
 * Security: Protected by CRON_SECRET
 */

import { NextResponse } from 'next/server';
import {
    releaseExpiredReservationsJob,
    reconcileStockJob,
    lowStockAlertJob
} from '@/lib/cron/inventory-jobs';

export async function GET(req) {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const job = searchParams.get('job') || 'release-expired';

    try {
        let result;

        switch (job) {
            case 'release-expired':
                await releaseExpiredReservationsJob();
                result = { job: 'release-expired', status: 'completed' };
                break;

            case 'reconcile':
                await reconcileStockJob();
                result = { job: 'reconcile', status: 'completed' };
                break;

            case 'low-stock-alert':
                await lowStockAlertJob();
                result = { job: 'low-stock-alert', status: 'completed' };
                break;

            case 'all':
                await releaseExpiredReservationsJob();
                await reconcileStockJob();
                await lowStockAlertJob();
                result = { job: 'all', status: 'completed' };
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid job type' },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Job failed', details: error.message },
            { status: 500 }
        );
    }
}

// Allow running this endpoint without authentication in development
export const dynamic = 'force-dynamic';

