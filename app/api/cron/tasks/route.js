/**
 * CRON JOBS API ENDPOINT
 * For Vercel cron or manual trigger
 * 
 * GET /api/cron/tasks?secret=YOUR_CRON_SECRET
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Inline simplified cron tasks (avoids .mjs import issues)
async function runScheduledTasks() {
    console.log('🕐 Running scheduled tasks...');
    console.log('Time:', new Date().toISOString());

    // Import modules dynamically to handle missing files gracefully
    const results = {
        reservationsReleased: 0,
        paymentsExpired: 0,
        ordersCompleted: 0
    };

    try {
        // Try to run stock reservation cleanup
        try {
            const { releaseExpiredReservations } = await import('@/lib/stockReservation');
            const released = await releaseExpiredReservations();
            results.reservationsReleased = released?.length || 0;
        } catch (e) {
            console.log('Stock reservation module not available:', e.message);
        }

        // Try to run order auto-complete
        try {
            const { autoCompleteOrders } = await import('@/lib/orderStateMachine-v2');
            const completed = await autoCompleteOrders();
            results.ordersCompleted = completed?.length || 0;
        } catch (e) {
            console.log('Order state machine module not available:', e.message);
        }

        console.log('✅ Scheduled tasks completed:', results);
        return results;

    } catch (error) {
        console.error('❌ Cron job error:', error);
        throw error;
    }
}

export async function GET(request) {
    // Verify secret
    const secret = request.nextUrl.searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const results = await runScheduledTasks();

        return NextResponse.json({
            success: true,
            message: 'Scheduled tasks completed',
            results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cron job error:', error);

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

