import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


// GET /api/admin/stats - Get dashboard statistics
export async function GET(request) {
    try {
        // Verify admin access
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get current month stats
        const [
            totalRevenueThisMonth,
            totalRevenueLastMonth,
            ordersThisMonth,
            ordersLastMonth,
            customersThisMonth,
            customersLastMonth,
            productsSoldThisMonth,
            productsSoldLastMonth,
        ] = await Promise.all([
            // Revenue this month
            prisma.payment.aggregate({
                where: {
                    status: 'SUCCESS',
                    paidAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
            // Revenue last month
            prisma.payment.aggregate({
                where: {
                    status: 'SUCCESS',
                    paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                _sum: { amount: true },
            }),
            // Orders this month
            prisma.order.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            // Orders last month
            prisma.order.count({
                where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
            }),
            // New customers this month
            prisma.users.count({
                where: {
                    role: 'CUSTOMER',
                    createdAt: { gte: startOfMonth },
                },
            }),
            // New customers last month
            prisma.users.count({
                where: {
                    role: 'CUSTOMER',
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
            // Products sold this month
            prisma.orderItem.aggregate({
                where: {
                    order: {
                        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
                        createdAt: { gte: startOfMonth },
                    },
                },
                _sum: { quantity: true },
            }),
            // Products sold last month
            prisma.orderItem.aggregate({
                where: {
                    order: {
                        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
                        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                    },
                },
                _sum: { quantity: true },
            }),
        ]);

        // Calculate percentage changes
        const calcChange = (current, previous) => {
            if (!previous || previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100 * 10) / 10;
        };

        const revenueNow = Number(totalRevenueThisMonth._sum.amount || 0);
        const revenuePrev = Number(totalRevenueLastMonth._sum.amount || 0);
        const productsNow = productsSoldThisMonth._sum.quantity || 0;
        const productsPrev = productsSoldLastMonth._sum.quantity || 0;

        const stats = [
            {
                label: 'Total Pendapatan',
                value: revenueNow,
                change: calcChange(revenueNow, revenuePrev),
                format: 'currency',
            },
            {
                label: 'Total Pesanan',
                value: ordersThisMonth,
                change: calcChange(ordersThisMonth, ordersLastMonth),
                format: 'number',
            },
            {
                label: 'Pelanggan Baru',
                value: customersThisMonth,
                change: calcChange(customersThisMonth, customersLastMonth),
                format: 'number',
            },
            {
                label: 'Produk Terjual',
                value: productsNow,
                change: calcChange(productsNow, productsPrev),
                format: 'number',
            },
        ];

        // Get order status counts
        const orderStatusCounts = await prisma.order.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        const statusCounts = {
            PENDING_PAYMENT: 0,
            PAID: 0,
            PROCESSING: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            COMPLETED: 0,
            CANCELLED: 0,
            REFUNDED: 0,
        };

        orderStatusCounts.forEach(item => {
            statusCounts[item.status] = item._count.status;
        });

        // Get recent orders
        const recentOrders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        const formattedOrders = recentOrders.map(order => ({
            id: order.orderNumber,
            customer: order.user?.name || 'Guest',
            total: Number(order.total),
            status: order.status,
            date: getRelativeTime(order.createdAt),
        }));

        // Get pending refunds count
        const pendingRefunds = await prisma.refundRequest.count({
            where: { status: 'PENDING' },
        });

        // Get Low Stock Count
        let lowStockThreshold = 5;
        try {
            const setting = await prisma.setting.findUnique({ where: { key: 'lowStockThreshold' } });
            if (setting) lowStockThreshold = parseInt(setting.value);
        } catch (e) { /* ignore */ }

        const lowStockCount = await prisma.product.count({
            where: {
                stock: { lte: lowStockThreshold },
                status: 'ACTIVE'
            }
        });

        return NextResponse.json({
            stats,
            statusCounts: {
                pendingPayment: statusCounts.PENDING_PAYMENT,
                needProcess: statusCounts.PAID,
                shipping: statusCounts.SHIPPED,
                pendingRefunds,
                lowStock: lowStockCount,
            },
            recentOrders: formattedOrders,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data statistik' },
            { status: 500 }
        );
    }
}

// Helper function for relative time
function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(date).toLocaleDateString('id-ID');
}

