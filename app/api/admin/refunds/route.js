import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/refunds
 * Get all refund requests
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
                { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [refunds, total] = await Promise.all([
            prisma.refundRequest.findMany({
                where,
                include: {
                    order: {
                        select: {
                            orderNumber: true,
                            total: true,
                            items: {
                                select: {
                                    product: { select: { name: true, images: true } },
                                    quantity: true,
                                    price: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: { name: true, email: true, phone: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.refundRequest.count({ where }),
        ]);

        // Get status counts
        const [pendingCount, approvedCount, rejectedCount, completedCount] = await Promise.all([
            prisma.refundRequest.count({ where: { status: 'PENDING' } }),
            prisma.refundRequest.count({ where: { status: 'APPROVED' } }),
            prisma.refundRequest.count({ where: { status: 'REJECTED' } }),
            prisma.refundRequest.count({ where: { status: 'COMPLETED' } }),
        ]);

        return NextResponse.json({
            success: true,
            refunds,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                completed: completedCount,
            },
        });
    } catch (error) {
        console.error('Get refunds error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch refunds' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/refunds
 * Update refund status (approve/reject)
 */
export const PUT = requireAdmin(async function PUT(request, context) {
    try {
        const { id, status, note } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Refund ID required' },
                { status: 400 }
            );
        }

        if (!['APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        const updateData = {
            status,
            processedBy: context.user.id,
            processedAt: new Date(),
        };

        if (note) {
            updateData.adminNote = note;
        }

        if (status === 'APPROVED') {
            updateData.approvedAt = new Date();
        } else if (status === 'REJECTED') {
            updateData.rejectedAt = new Date();
            updateData.rejectionNote = note;
        }

        const refund = await prisma.refundRequest.update({
            where: { id },
            data: updateData,
            include: {
                order: { select: { orderNumber: true } },
                user: { select: { name: true, email: true } },
            },
        });

        return NextResponse.json({
            success: true,
            refund,
            message: status === 'APPROVED' ? 'Refund disetujui' :
                status === 'REJECTED' ? 'Refund ditolak' : 'Status updated',
        });
    } catch (error) {
        console.error('Update refund error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update refund' },
            { status: 500 }
        );
    }
});

