import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { runOrderAutomation } from '@/lib/automation';


/**
 * Cron job endpoint for order automation
 * Should be called periodically (every hour or daily)
 * 
 * Set up with:
 * - Vercel Cron Jobs
 * - GitHub Actions scheduled workflow
 *- External cron service (cron-job.org)
 */
export async function GET(request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // SECURITY: Require CRON_SECRET to be configured
        if (!cronSecret) {
            console.error('❌ CRON_SECRET not configured - Cron endpoint disabled');
            return NextResponse.json(
                { error: 'Server misconfiguration - contact administrator' },
                { status: 500 }
            );
        }

        // Verify authorization header matches secret
        if (authHeader !== `Bearer ${cronSecret}`) {
            console.warn('⚠️  Unauthorized cron access attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('🤖 Cron job triggered - Starting order automation');

        const results = await runOrderAutomation();

        return NextResponse.json({
            success: true,
            message: 'Order automation completed',
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Automation failed', details: error.message },
            { status: 500 }
        );
    }
}

// Allow POST for manual trigger
export async function POST(request) {
    return GET(request);
}

