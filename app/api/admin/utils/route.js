/**
 * ADMIN UTILITIES API
 * Manual triggers for admin dashboard
 */

import { NextResponse } from 'next/server';
import { getWalletBalance } from '@/lib/escrowManager';
import { getAuditTrail } from '@/lib/auditLogger';
import { getWebhookStats } from '@/lib/webhookLogger';
import { getReservationStatus } from '@/lib/stockReservation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/utils/wallet-balance?userId=xxx
 */
export async function GET(request) {
    const userId = request.nextUrl.searchParams.get('userId');
    const action = request.nextUrl.searchParams.get('action');

    try {
        if (action === 'wallet-balance' && userId) {
            const balance = await getWalletBalance(userId);
            return NextResponse.json(balance);
        }

        if (action === 'audit-trail') {
            const resource = request.nextUrl.searchParams.get('resource');
            const trail = await getAuditTrail(resource);
            return NextResponse.json({ trail });
        }

        if (action === 'webhook-stats') {
            const provider = request.nextUrl.searchParams.get('provider') || 'midtrans';
            const stats = await getWebhookStats(provider);
            return NextResponse.json(stats);
        }

        if (action === 'reservation-status') {
            const orderId = request.nextUrl.searchParams.get('orderId');
            const status = await getReservationStatus(orderId);
            return NextResponse.json({ reservations: status });
        }

        return NextResponse.json({
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}

