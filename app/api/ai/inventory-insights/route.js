/**
 * AI Inventory Insights API
 * GET /api/ai/inventory-insights
 */

import { NextResponse } from 'next/server';
import { getInventoryInsights, getQuickInventoryStats } from '@/lib/ai-inventory';
import { requireAuth, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async function GET(request, context) {
    try {
        // Check if user is admin
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'full'; // 'full' or 'quick'

        if (type === 'quick') {
            const stats = await getQuickInventoryStats();
            return NextResponse.json({
                success: true,
                stats
            });
        }

        const result = await getInventoryInsights();
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI Inventory API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get inventory insights', details: error.message },
            { status: 500 }
        );
    }
});

