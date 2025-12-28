import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/orderStateMachine';
import { ApiResponse, asyncHandler } from '@/lib/errors';

/**
 * ADMIN REFUND ACTIONS
 * Approve/reject refund requests
 */

// PATCH /api/refunds/[id] - Update refund status (Admin only)
export async function PATCH(request, { params }) {
    try {
        const auth = await verifyAuth(request);

        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return ApiResponse.error('Admin access  required', 403);
        }

        const { id } = params;
        const body = await request.json();
        const { action, adminNotes, rejectedReason } = body;

        // Get refund request
        const refund = await prisma.refund_requests.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        items: true
                    }
                }
            }
        });

        if (!refund) {
            return ApiResponse.error('Refund request tidak ditemukan', 404);
        }

        if (refund.status !== 'PENDING') {
            return ApiResponse.error('Refund request sudah diproses');
        }

        let updatedRefund;

        if (action === 'APPROVE') {
            // Approve refund
            updatedRefund = await prisma.$transaction(async (tx) => {
                // Update refund status
                const updated = await tx.refundRequest.update({
                    where: { id },
                    data: {
                        status: 'APPROVED',
                        resolvedBy: auth.user.id,
                        resolvedAt: new Date(),
                        adminNotes
                    }
                });

                // Update order status to REFUNDED
                await updateOrderStatus(
                    refund.orderId,
                    'REFUNDED',
                    auth.user.id,
                    'Refund approved by admin'
                );

                return updated;
            });

        } else if (action === 'REJECT') {
            // Reject refund
            updatedRefund = await prisma.refund_requests.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    resolvedBy: auth.user.id,
                    resolvedAt: new Date(),
                    rejectedReason: rejectedReason || adminNotes,
                    adminNotes
                }
            });

        } else {
            return ApiResponse.error('Invalid action. Use APPROVE or REJECT');
        }

        return ApiResponse.success(updatedRefund, `Refund ${action.toLowerCase()}d successfully`);

    } catch (error) {
        console.error('Refund action error:', error);
        return ApiResponse.error(error.message, 500);
    }
}
