import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


// GET /api/admin/chat - Get all chat conversations
export async function GET(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (userId) {
            // Get messages for specific user
            const messages = await prisma.chatMessage.findMany({
                where: { userId },
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        select: { name: true, email: true, avatarUrl: true },
                    },
                },
            });

            return NextResponse.json({
                messages: messages.map(m => ({
                    id: m.id,
                    message: m.message,
                    imageUrl: m.imageUrl,
                    isAdmin: m.isAdmin,
                    createdAt: m.createdAt,
                })),
                user: messages[0]?.user || null,
            });
        }

        // Get list of conversations (grouped by user)
        const conversations = await prisma.$queryRaw`
            SELECT 
                cm.user_id as "userId",
                u.name as "userName",
                u.avatar_url as "userAvatar",
                MAX(cm.created_at) as "lastMessageAt",
                (SELECT message FROM chat_messages WHERE user_id = cm.user_id ORDER BY created_at DESC LIMIT 1) as "lastMessage",
                COUNT(CASE WHEN cm.is_admin = false AND cm.read_at IS NULL THEN 1 END) as "unreadCount"
            FROM chat_messages cm
            JOIN users u ON u.id = cm.user_id
            GROUP BY cm.user_id, u.name, u.avatar_url
            ORDER BY MAX(cm.created_at) DESC
        `;

        return NextResponse.json({
            conversations: conversations.map(c => ({
                userId: c.userId,
                userName: c.userName,
                userAvatar: c.userAvatar,
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt,
                unreadCount: Number(c.unreadCount),
            })),
        });
    } catch (error) {
        console.error('Admin chat error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data chat' }, { status: 500 });
    }
}

// POST /api/admin/chat - Admin sends reply
export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, message, imageUrl, orderId } = body;

        if (!userId || (!message && !imageUrl)) {
            return NextResponse.json(
                { error: 'User ID dan pesan wajib diisi' },
                { status: 400 }
            );
        }

        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId,
                orderId: orderId || null,
                message: message || '',
                imageUrl: imageUrl || null,
                isAdmin: true,
            },
        });

        return NextResponse.json({
            message: 'Balasan terkirim',
            chat: {
                id: chatMessage.id,
                message: chatMessage.message,
                isAdmin: true,
                createdAt: chatMessage.createdAt,
            },
        });
    } catch (error) {
        console.error('Admin reply error:', error);
        return NextResponse.json({ error: 'Gagal mengirim balasan' }, { status: 500 });
    }
}

