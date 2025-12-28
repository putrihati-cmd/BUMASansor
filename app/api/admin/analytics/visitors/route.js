import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/visitors
 * Get visitor statistics (simplified - based on orders and users)
 */
export async function GET(request) {
    try {
        // Verify admin auth
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count unique visitors (approximation based on users + guest orders)
        const [
            registeredUsersToday,
            registeredUsersWeek,
            registeredUsersMonth,
            totalUsers,
            ordersToday,
            ordersWeek,
            guestOrdersMonth,
        ] = await Promise.all([
            // Users created today
            prisma.users.count({
                where: { createdAt: { gte: startOfToday } },
            }),
            // Users created this week
            prisma.users.count({
                where: { createdAt: { gte: startOfWeek } },
            }),
            // Users created this month
            prisma.users.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            // Total users
            prisma.users.count(),
            // Orders today (as proxy for visitors)
            prisma.orders.count({
                where: { createdAt: { gte: startOfToday } },
            }),
            // Orders this week
            prisma.orders.count({
                where: { createdAt: { gte: startOfWeek } },
            }),
            // Guest orders this month (unique visitors approximation)
            prisma.orders.count({
                where: {
                    createdAt: { gte: startOfMonth },
                    userId: null, // Guest orders
                },
            }),
        ]);

        // Calculate returning vs new visitors rate
        const returningCustomersMonth = await prisma.orders.groupBy({
            by: ['userId'],
            where: {
                createdAt: { gte: startOfMonth },
                userId: { not: null },
            },
            _count: { userId: true },
            having: {
                userId: {
                    _count: { gt: 1 },
                },
            },
        });

        // Bounce rate approximation (orders with only 1 item vs multiple items)
        const singleItemOrders = await prisma.orders.count({
            where: {
                createdAt: { gte: startOfMonth },
                items: { some: {} },
            },
        });

        return NextResponse.json({
            success: true,
            stats: {
                today: {
                    visitors: registeredUsersToday + ordersToday,
                    newUsers: registeredUsersToday,
                    orders: ordersToday,
                },
                week: {
                    visitors: registeredUsersWeek + ordersWeek,
                    newUsers: registeredUsersWeek,
                    orders: ordersWeek,
                },
                month: {
                    visitors: registeredUsersMonth + guestOrdersMonth,
                    newUsers: registeredUsersMonth,
                    guestOrders: guestOrdersMonth,
                    returningCustomers: returningCustomersMonth.length,
                },
                total: {
                    users: totalUsers,
                },
            },
        });

    } catch (error) {
        console.error('Visitor stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch visitor stats' },
            { status: 500 }
        );
    }
}

