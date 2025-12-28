import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { requireAuth } from '@/lib/auth';


export const GET = requireAuth(async function GET(request, context) {
    try {
        // Only admins can access analytics
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '90d':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Get revenue data grouped by date
        const revenueData = await prisma.orders.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: startDate,
                },
                status: {
                    in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'],
                },
            },
            _sum: {
                total: true,
            },
            _count: {
                id: true,
            },
        });

        // Format data for charts
        const dailyRevenue = revenueData.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            revenue: Number(item._sum.total || 0),
            orders: item._count.id,
        }));

        // Group by date (aggregate multiple orders per day)
        const groupedRevenue = dailyRevenue.reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date);
            if (existing) {
                existing.revenue += curr.revenue;
                existing.orders += curr.orders;
            } else {
                acc.push({ ...curr });
            }
            return acc;
        }, []);

        // Sort by date
        groupedRevenue.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Get summary stats
        const totalRevenue = groupedRevenue.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = groupedRevenue.reduce((sum, item) => sum + item.orders, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get previous period for comparison
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - (now.getDate() - startDate.getDate()));

        const previousRevenue = await prisma.orders.aggregate({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate,
                },
                status: {
                    in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'],
                },
            },
            _sum: {
                total: true,
            },
            _count: {
                id: true,
            },
        });

        const revenueGrowth = previousRevenue._sum.total
            ? ((totalRevenue - Number(previousRevenue._sum.total)) / Number(previousRevenue._sum.total) * 100).toFixed(1)
            : 0;

        const ordersGrowth = previousRevenue._count.id
            ? ((totalOrders - previousRevenue._count.id) / previousRevenue._count.id * 100).toFixed(1)
            : 0;

        return NextResponse.json({
            success: true,
            period,
            summary: {
                totalRevenue: Math.round(totalRevenue),
                totalOrders,
                averageOrderValue: Math.round(averageOrderValue),
                revenueGrowth: Number(revenueGrowth),
                ordersGrowth: Number(ordersGrowth),
            },
            chartData: groupedRevenue,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
});

