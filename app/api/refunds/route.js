import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';

import { ApiResponse, asyncHandler } from '@/lib/errors';


/**
 * REFUND REQUEST API
 * Allows customers to request refunds for their orders
 */

// GET /api/refunds - Get user's refund requests
export const GET = asyncHandler(async function GET(request) {
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return ApiResponse.error('Unauthorized', 401);
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role);

    const where = isAdmin ? {} : { userId: auth.user.id };

    const refunds = await prisma.refundRequest.findMany({
        where,
        include: {
            order: {
                select: {
                    orderNumber: true,
                    total: true,
                    createdAt: true
                }
            },
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return ApiResponse.success(refunds);
});

// POST /api/refunds - Create refund request
export const POST = asyncHandler(async function POST(request) {
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return ApiResponse.error('Unauthorized', 401);
    }

    const body = await request.json();
    const { orderId, reason, refundType = 'FULL', evidence } = body;

    // Validation
    if (!orderId || !reason) {
        return ApiResponse.error('Order ID dan alasan refund wajib diisi');
    }

    // Check order ownership
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: auth.user.id
        },
        include: {
            refundRequests: true
        }
    });

    if (!order) {
        return ApiResponse.error('Order tidak ditemukan', 404);
    }

    // Check if order is eligible for refund
    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
        return ApiResponse.error('Order belum bisa direfund. Tunggu hingga status DELIVERED atau COMPLETED');
    }

    // Check if refund already exists
    const existingRefund = order.refundRequests.find(r =>
        ['PENDING', 'APPROVED', 'PROCESSING'].includes(r.status)
    );

    if (existingRefund) {
        return ApiResponse.error('Sudah ada pengajuan refund untuk order ini');
    }

    // Create refund request
    const refund = await prisma.refundRequest.create({
        data: {
            orderId,
            userId: auth.user.id,
            reason,
            refundType,
            amount: order.total,
            evidence: evidence || null,
            status: 'PENDING'
        },
        include: {
            order: {
                select: {
                    orderNumber: true
                }
            }
        }
    });

    return ApiResponse.success(refund, 'Pengajuan refund berhasil. Tim kami akan meninjau dalam 1x24 jam', 201);
});

