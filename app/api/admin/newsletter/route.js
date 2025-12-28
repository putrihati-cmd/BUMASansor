import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/newsletter
 * Get all newsletter subscribers
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
            where.email = { contains: search, mode: 'insensitive' };
        }

        const [subscribers, total] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                orderBy: { subscribedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.newsletterSubscriber.count({ where }),
        ]);

        // Get status counts
        const [activeCount, unsubscribedCount] = await Promise.all([
            prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
            prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
        ]);

        return NextResponse.json({
            success: true,
            subscribers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total,
                active: activeCount,
                unsubscribed: unsubscribedCount,
            },
        });
    } catch (error) {
        console.error('Get newsletter error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch subscribers' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/newsletter
 * Remove subscriber
 */
export const DELETE = requireAdmin(async function DELETE(request, context) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Subscriber ID required' },
                { status: 400 }
            );
        }

        await prisma.newsletterSubscriber.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Subscriber removed',
        });
    } catch (error) {
        console.error('Delete subscriber error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove subscriber' },
            { status: 500 }
        );
    }
});

/**
 * GET /api/admin/newsletter/export
 * Export active subscribers as CSV
 */
export async function exportSubscribers() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: 'ACTIVE' },
        select: { email: true, subscribedAt: true },
    });

    const csv = ['email,subscribedAt'];
    subscribers.forEach(s => {
        csv.push(`${s.email},${s.subscribedAt.toISOString()}`);
    });

    return csv.join('\n');
}

