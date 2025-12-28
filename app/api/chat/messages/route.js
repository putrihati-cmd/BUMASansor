/**
 * Customer Chat API
 * Customer send message and get chat history
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { requireAuth } from '@/lib/auth';


/**
 * POST /api/chat/messages
 * Customer send message to admin
 */
export const POST = requireAuth(async function POST(request, context) {
    try {
        const { message, orderId, imageUrl } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Create chat message
        const chatMessage = await prisma.chat_messages.create({
            data: {
                userId: context.user.id,
                message,
                orderId,
                imageUrl,
                isAdmin: false
            }
        });

        return NextResponse.json({
            success: true,
            message: chatMessage
        });

    } catch (error) {
        console.error('[Customer Chat Send] Error:', error);
        return NextResponse.json(
            { error: 'Failed to send message', details: error.message },
            { status: 500 }
        );
    }
});

/**
 * GET /api/chat/messages
 * Get chat history for current customer
 */
export const GET = requireAuth(async function GET(request, context) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        const where = {
            userId: context.user.id
        };

        if (orderId) {
            where.orderId = orderId;
        }

        const messages = await prisma.chat_messages.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            take: 100
        });

        // Mark admin messages as read
        await prisma.chat_messages.updateMany({
            where: {
                userId: context.user.id,
                isAdmin: true,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        });

        return NextResponse.json({
            messages: messages.map(m => ({
                id: m.id,
                message: m.message,
                imageUrl: m.imageUrl,
                isAdmin: m.isAdmin,
                orderId: m.orderId,
                createdAt: m.createdAt,
                readAt: m.readAt
            }))
        });

    } catch (error) {
        console.error('[Customer Chat History] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get chat history', details: error.message },
            { status: 500 }
        );
    }
});

