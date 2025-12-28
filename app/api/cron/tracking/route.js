/**
 * CRON ENDPOINT - Tracking Jobs
 * 
 * Endpoint: GET /api/cron/tracking
 * 
 * Triggers shipment tracking jobs:
 * - Sync active shipments
 * - Alert stuck shipments
 * - Process pending webhooks
 * 
 * Security: Protected by CRON_SECRET
 */

import { NextResponse } from 'next/server';
import {
    syncAllActiveShipmentsJob,
    alertStuckShipmentsJob,
    processPendingWebhooksJob
} from '@/lib/cron/tracking-jobs';

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
    const job = searchParams.get('job') || 'sync';

    try {
        let result;

        switch (job) {
            case 'sync':
                await syncAllActiveShipmentsJob();
                result = { job: 'sync', status: 'completed' };
                break;

            case 'stuck-alert':
                await alertStuckShipmentsJob();
                result = { job: 'stuck-alert', status: 'completed' };
                break;

            case 'process-webhooks':
                await processPendingWebhooksJob();
                result = { job: 'process-webhooks', status: 'completed' };
                break;

            case 'all':
                await syncAllActiveShipmentsJob();
                await alertStuckShipmentsJob();
                await processPendingWebhooksJob();
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

export const dynamic = 'force-dynamic';

