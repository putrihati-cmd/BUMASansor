import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/messages
 * Get all contact messages
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [messages, total] = await Promise.all([
            prisma.contact_messages.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.contact_messages.count({ where }),
        ]);

        // Get status counts
        const [newCount, inProgressCount, resolvedCount, closedCount] = await Promise.all([
            prisma.contact_messages.count({ where: { status: 'NEW' } }),
            prisma.contact_messages.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.contact_messages.count({ where: { status: 'RESOLVED' } }),
            prisma.contact_messages.count({ where: { status: 'CLOSED' } }),
        ]);

        return NextResponse.json({
            success: true,
            messages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total,
                new: newCount,
                inProgress: inProgressCount,
                resolved: resolvedCount,
                closed: closedCount,
            },
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/messages
 * Update message status
 */
export const PUT = requireAdmin(async function PUT(request, context) {
    try {
        const { id, status, reply } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Message ID required' },
                { status: 400 }
            );
        }

        const updateData = {};

        if (status) {
            updateData.status = status;
        }

        if (reply) {
            updateData.adminReply = reply;
            updateData.repliedAt = new Date();
            updateData.repliedBy = context.user.id;
        }

        const message = await prisma.contact_messages.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message,
        });
    } catch (error) {
        console.error('Update message error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update message' },
            { status: 500 }
        );
    }
});

