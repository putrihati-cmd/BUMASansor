/**
 * AI Product Recommendations API
 * GET /api/ai/recommendations
 */

import { NextResponse } from 'next/server';
import { getRecommendations, getFrequentlyBoughtTogether } from '@/lib/ai-recommendations';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const categoryId = searchParams.get('categoryId');
        const context = searchParams.get('context') || 'homepage';
        const limit = parseInt(searchParams.get('limit')) || 8;
        const type = searchParams.get('type') || 'recommendations'; // 'recommendations' or 'bought-together'

        // Try to get user ID if authenticated
        let userId = null;
        try {
            const auth = await verifyAuth(request);
            if (auth.success && auth.user) {
                userId = auth.user.id;
            }
        } catch {
            // Not authenticated, continue without userId
        }

        let result;

        if (type === 'bought-together' && productId) {
            // "Customers also bought" recommendations
            const products = await getFrequentlyBoughtTogether(productId, limit);
            result = {
                recommendations: products,
                context: 'bought-together',
                algorithm: 'collaborative'
            };
        } else {
            // Standard recommendations
            result = await getRecommendations({
                userId,
                productId,
                categoryId,
                context,
                limit
            });
        }

        return NextResponse.json({
            success: true,
            ...result,
            count: result.recommendations.length
        });
    } catch (error) {
        console.error('[AI Recommendations API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get recommendations', details: error.message },
            { status: 500 }
        );
    }
}

