import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


// GET /api/chat - Get chat messages
export async function GET(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const limit = parseInt(searchParams.get('limit')) || 50;
        const before = searchParams.get('before'); // cursor for pagination

        const where = {
            userId: auth.user.id,
        };

        if (orderId) {
            where.orderId = orderId;
        }

        if (before) {
            where.createdAt = { lt: new Date(before) };
        }

        const messages = await prisma.chatMessage.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // Mark unread messages as read
        await prisma.chatMessage.updateMany({
            where: {
                userId: auth.user.id,
                isAdmin: true, // Only mark admin messages as read
                readAt: null,
            },
            data: { readAt: new Date() },
        });

        // Get unread count
        const unreadCount = await prisma.chatMessage.count({
            where: {
                userId: auth.user.id,
                isAdmin: true,
                readAt: null,
            },
        });

        return NextResponse.json({
            messages: messages.reverse().map(m => ({
                id: m.id,
                message: m.message,
                imageUrl: m.imageUrl,
                isAdmin: m.isAdmin,
                createdAt: m.createdAt,
            })),
            unreadCount,
        });
    } catch (error) {
        console.error('Get chat error:', error);
        return NextResponse.json({ error: 'Gagal mengambil chat' }, { status: 500 });
    }
}

// POST /api/chat - Send chat message
export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, imageUrl, orderId } = body;

        if (!message && !imageUrl) {
            return NextResponse.json(
                { error: 'Pesan atau gambar wajib diisi' },
                { status: 400 }
            );
        }

        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId: auth.user.id,
                orderId: orderId || null,
                message: message || '',
                imageUrl: imageUrl || null,
                isAdmin: false,
            },
        });

        return NextResponse.json({
            message: 'Pesan terkirim',
            chat: {
                id: chatMessage.id,
                message: chatMessage.message,
                imageUrl: chatMessage.imageUrl,
                isAdmin: chatMessage.isAdmin,
                createdAt: chatMessage.createdAt,
            },
        });
    } catch (error) {
        console.error('Send chat error:', error);
        return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 });
    }
}

