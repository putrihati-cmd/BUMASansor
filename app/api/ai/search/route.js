/**
 * AI-Powered Search API
 * GET /api/ai/search
 */

import { NextResponse } from 'next/server';
import { searchProducts, getSearchSuggestions } from '@/lib/ai-search';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('query');
        const type = searchParams.get('type') || 'search'; // 'search' or 'suggestions'
        const limit = parseInt(searchParams.get('limit')) || 20;
        const offset = parseInt(searchParams.get('offset')) || 0;

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        if (type === 'suggestions') {
            // Get search suggestions
            const result = await getSearchSuggestions(query);
            return NextResponse.json({
                success: true,
                ...result
            });
        }

        // Perform AI-enhanced search
        const result = await searchProducts({
            query,
            useAI: true,
            limit,
            offset
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI Search API] Error:', error);
        return NextResponse.json(
            { error: 'Search failed', details: error.message },
            { status: 500 }
        );
    }
}

