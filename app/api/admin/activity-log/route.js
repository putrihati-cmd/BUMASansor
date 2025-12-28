import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


/**
 * GET /api/admin/activity-log
 * Get activity log entries
 */
export async function GET(request) {
    try {
        // Verify admin auth
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');

        const where = {};
        if (action) where.action = action;
        if (userId) where.userId = userId;

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: {
                    user: {
                        select: { name: true, email: true, role: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.activityLog.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Activity log error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity log' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/activity-log
 * Create activity log entry (for manual logging)
 */
export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, entity, entityId, details } = await request.json();

        const log = await prisma.activityLog.create({
            data: {
                userId: auth.user.id,
                action,
                entity,
                entityId,
                details,
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown',
            },
        });

        return NextResponse.json({
            success: true,
            log,
        });

    } catch (error) {
        console.error('Create activity log error:', error);
        return NextResponse.json(
            { error: 'Failed to create log entry' },
            { status: 500 }
        );
    }
}

