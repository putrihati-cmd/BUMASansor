import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


/**
 * GET /api/admin/analytics/sales-chart
 * Get sales data for charts (last 30 days)
 */
export async function GET(request) {
    try {
        // Verify admin auth
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Get date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch orders grouped by date
        const orders = await prisma.orders.findMany({
            where: {
                createdAt: { gte: startDate },
                status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
            },
            select: {
                createdAt: true,
                total: true,
                status: true,
            },
        });

        // Group by date
        const salesByDate = {};
        const ordersByDate = {};

        orders.forEach(order => {
            const dateKey = order.createdAt.toISOString().split('T')[0];

            if (!salesByDate[dateKey]) {
                salesByDate[dateKey] = 0;
                ordersByDate[dateKey] = 0;
            }

            salesByDate[dateKey] += Number(order.total);
            ordersByDate[dateKey] += 1;
        });

        // Fill missing dates with 0
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];

            chartData.push({
                date: dateKey,
                dateLabel: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                sales: salesByDate[dateKey] || 0,
                orders: ordersByDate[dateKey] || 0,
            });
        }

        // Get status distribution
        const statusDistribution = await prisma.orders.groupBy({
            by: ['status'],
            where: {
                createdAt: { gte: startDate },
            },
            _count: { status: true },
        });

        const statusData = statusDistribution.map(item => ({
            name: item.status,
            value: item._count.status,
        }));

        // Top products
        const topProducts = await prisma.order_items.groupBy({
            by: ['productId'],
            where: {
                order: {
                    createdAt: { gte: startDate },
                    status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
                },
            },
            _sum: {
                quantity: true,
                subtotal: true,
            },
            orderBy: {
                _sum: {
                    subtotal: 'desc',
                },
            },
            take: 5,
        });

        const topProductsWithNames = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.products.findUnique({
                    where: { id: item.productId },
                    select: { name: true },
                });
                return {
                    name: product?.name || 'Unknown',
                    quantity: item._sum.quantity,
                    revenue: Number(item._sum.subtotal),
                };
            })
        );

        return NextResponse.json({
            success: true,
            chartData,
            statusData,
            topProducts: topProductsWithNames,
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}

