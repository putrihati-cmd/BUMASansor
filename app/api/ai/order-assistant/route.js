/**
 * AI Order Assistant API
 * POST /api/ai/order-assistant
 */

import { NextResponse } from 'next/server';
import { getOrderSummary, answerOrderQuestion } from '@/lib/ai-order-assistant';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, question, action } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        if (action === 'summary') {
            // Get order summary with AI insights
            const result = await getOrderSummary(orderId, auth.user.id);
            return NextResponse.json(result);
        }

        if (action === 'ask' && question) {
            // Answer a question about the order
            const result = await answerOrderQuestion(orderId, question, auth.user.id);
            return NextResponse.json(result);
        }

        // Default: get summary
        const result = await getOrderSummary(orderId, auth.user.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI Order Assistant API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const result = await getOrderSummary(orderId, auth.user.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[AI Order Assistant API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get order summary', details: error.message },
            { status: 500 }
        );
    }
}

