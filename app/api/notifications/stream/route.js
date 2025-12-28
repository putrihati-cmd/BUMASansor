/**
 * API: SSE Stream for Real-Time Notifications
 * Vercel-compatible Server-Sent Events
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { pubsub } from '@/lib/pubsub';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    const auth = await verifyAuth(request);

    if (!auth.success) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            const send = (data) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            send({ type: 'connected', message: 'SSE connection established' });

            const unsubscribe = pubsub.subscribe(`notifications:${userId}`, (notification) => {
                send({
                    type: 'notification',
                    data: notification
                });
            });

            const heartbeat = setInterval(() => {
                send({ type: 'heartbeat', timestamp: Date.now() });
            }, 30000);

            request.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                unsubscribe();
                controller.close();
            });
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    });
}

