import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


// GET /api/admin/customers - Get all customers for admin
export async function GET(request) {
    try {
        // Verify admin access
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build where clause
        const where = {
            role: 'CUSTOMER',
        };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get customers with pagination
        const [customers, total] = await Promise.all([
            prisma.users.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    _count: {
                        select: { orders: true, reviews: true },
                    },
                    orders: {
                        select: { total: true, status: true },
                        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] } },
                    },
                },
            }),
            prisma.users.count({ where }),
        ]);

        // Format customers
        const formattedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '-',
            avatarUrl: customer.avatarUrl,
            status: customer.status,
            orderCount: customer._count.orders,
            reviewCount: customer._count.reviews,
            totalSpent: customer.orders.reduce((sum, o) => sum + Number(o.total), 0),
            emailVerified: !!customer.emailVerifiedAt,
            createdAt: customer.createdAt,
        }));

        return NextResponse.json({
            customers: formattedCustomers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin customers error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data pelanggan' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/customers - Update customer status
export async function PATCH(request) {
    try {
        // Verify admin access
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, status } = body;

        if (!userId || !status) {
            return NextResponse.json(
                { error: 'User ID dan status wajib diisi' },
                { status: 400 }
            );
        }

        if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
            return NextResponse.json(
                { error: 'Status tidak valid' },
                { status: 400 }
            );
        }

        const user = await prisma.users.update({
            where: { id: userId },
            data: { status },
        });

        return NextResponse.json({
            message: `Pelanggan berhasil ${status === 'SUSPENDED' ? 'dinonaktifkan' : 'diaktifkan'}`,
            user: {
                id: user.id,
                name: user.name,
                status: user.status,
            },
        });
    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json(
            { error: 'Gagal mengupdate pelanggan' },
            { status: 500 }
        );
    }
}

