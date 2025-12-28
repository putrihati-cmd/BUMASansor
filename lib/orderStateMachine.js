import prisma from './prisma';
import { logOrderStatusChange } from './activityLogger';

/**
 * ORDER STATE MACHINE
 * Enforces valid order status transitions
 * Prevents invalid state changes
 */

// Valid state transitions - Source: ORDER_PAYMENT_RULES.md section 3
// Transitions EXACTLY as defined in rules
const VALID_TRANSITIONS = {
    DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
    PENDING_PAYMENT: ['PAID', 'FAILED', 'CANCELLED'], // Added FAILED per rules section 5
    PAID: ['PROCESSING'],                              // Strict: only PROCESSING allowed
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['COMPLETED'],                            // Direct to COMPLETED per rules section 3
    DELIVERED: ['COMPLETED'],                          // DEPRECATED - backward compatibility only
    COMPLETED: [],                                     // Terminal state
    CANCELLED: [],                                     // Terminal state
    FAILED: [],                                        // Terminal state - payment failed
    REFUNDED: [],                                      // DEPRECATED - out of scope (rules section 11)
};

/**
 * Check if transition is valid
 */
export function isValidTransition(fromStatus, toStatus) {
    if (!fromStatus) return true; // New order

    const allowed = VALID_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
}

/**
 * Get allowed next states
 */
export function getAllowedNextStates(currentStatus) {
    return VALID_TRANSITIONS[currentStatus] || [];
}

/**
 * Update order status with validation and logging
 */
export async function updateOrderStatus(orderId, toStatus, changedBy, reason = null, metadata = null) {
    return await prisma.$transaction(async (tx) => {
        // Get current order
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                }
            }
        });

        if (!order) {
            throw new Error('Order tidak ditemukan');
        }

        const fromStatus = order.status;

        // Validate transition
        if (!isValidTransition(fromStatus, toStatus)) {
            throw new Error(
                `Invalid status transition: ${fromStatus} → ${toStatus}. ` +
                `Allowed transitions: ${VALID_TRANSITIONS[fromStatus]?.join(', ') || 'none'}`
            );
        }

        // ============================================================
        // CRITICAL GUARD: Order can only be PAID if Payment is SUCCESS
        // ============================================================
        if (toStatus === 'PAID') {
            const payment = await tx.payment.findUnique({
                where: { orderId }
            });

            if (!payment) {
                throw new Error('GUARD_VIOLATION: Cannot set order to PAID - No payment record found');
            }

            if (payment.status !== 'SUCCESS') {
                throw new Error(
                    `GUARD_VIOLATION: Cannot set order to PAID - Payment status is ${payment.status}, must be SUCCESS`
                );
            }

            // Update paidAt timestamp on payment if not already set
            if (!payment.paidAt) {
                await tx.payment.update({
                    where: { orderId },
                    data: { paidAt: new Date() }
                });
            }
        }

        // Update order
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: { status: toStatus }
        });

        // Log state change
        await tx.orderStateLog.create({
            data: {
                orderId,
                fromStatus,
                toStatus,
                changedBy,
                reason,
                metadata: metadata || {}
            }
        });

        // Log to activity log for audit trail
        await logOrderStatusChange(orderId, fromStatus, toStatus, changedBy, reason);

        // Handle side effects based on status change
        await handleStatusSideEffects(tx, order, fromStatus, toStatus);

        return updatedOrder;
    });
}

/**
 * Handle side effects of status changes
 */
async function handleStatusSideEffects(tx, order, fromStatus, toStatus) {
    // Import inventory functions (avoid circular dependency)
    const { restoreStock, reduceStock } = await import('./inventory');

    switch (toStatus) {
        case 'PAID':
            // ============================================================
            // CRITICAL: STOCK REDUCTION SAAT PAID
            // This implements the requirement: "Stock dikurangi HANYA saat PAID"
            // ============================================================
            const items = order.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            }));

            try {
                // Note: reduceStock needs orderId as string, not object id
                await reduceStock(items, order.id, order.userId);
                console.log(`✅ Stock reduced for order ${order.orderNumber} (PAID)`);
            } catch (error) {
                // If stock reduction fails, we should NOT proceed with PAID status
                // This prevents overselling
                throw new Error(
                    `Stock reduction failed for order ${order.orderNumber}: ${error.message}`
                );
            }
            break;

        case 'CANCELLED':
            // Restore stock when order is cancelled
            // ONLY if stock was already deducted (order was PAID or PROCESSING)
            if (['PAID', 'PROCESSING'].includes(fromStatus)) {
                const items = order.items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                }));

                await restoreStock(items, order.id, 'ORDER_CANCELLED', order.userId);
            }
            // If cancelled from PENDING_PAYMENT, no need to restore (stock never deducted)
            break;

        case 'FAILED':
            // Order FAILED only reachable from PENDING_PAYMENT (per state machine)
            // Stock was never deducted, so no need to restore
            // This is payment failure before order was PAID
            break;

        case 'REFUNDED':
            // DEPRECATED - REFUND is out of scope per ORDER_PAYMENT_RULES.md section 11
            // Kept for backward compatibility only
            // This code path should not be reachable in production
            const refundItems = order.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            }));

            await restoreStock(refundItems, order.id, 'RETURN', order.userId);
            break;

        case 'COMPLETED':
            // Award loyalty points when order is completed
            const pointsToAward = Math.floor(Number(order.total) / 1000); // 1 point per 1000 rupiah

            if (pointsToAward > 0) {
                // Update user points
                await tx.userPoints.upsert({
                    where: { userId: order.userId },
                    create: {
                        userId: order.userId,
                        points: pointsToAward
                    },
                    update: {
                        points: { increment: pointsToAward }
                    }
                });

                // Log point transaction
                await tx.pointTransaction.create({
                    data: {
                        userId: order.userId,
                        points: pointsToAward,
                        type: 'EARN',
                        description: `Poin dari order ${order.orderNumber}`,
                        orderId: order.id
                    }
                });
            }
            break;
    }
}

/**
 * Get order state history
 */
export async function getOrderStateHistory(orderId) {
    return await prisma.orderStateLog.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' }
    });
}

/**
 * Bulk cancel expired unpaid orders
 */
export async function cancelExpiredOrders() {
    const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const expiredOrders = await prisma.orders.findMany({
        where: {
            status: 'PENDING_PAYMENT',
            createdAt: {
                lt: expiryTime
            }
        },
        include: {
            items: true
        }
    });

    const results = [];

    for (const order of expiredOrders) {
        try {
            await updateOrderStatus(
                order.id,
                'CANCELLED',
                'SYSTEM',
                'Auto-cancelled: Payment not received within 24 hours'
            );
            results.push({ orderId: order.id, success: true });
        } catch (error) {
            results.push({ orderId: order.id, success: false, error: error.message });
        }
    }

    return results;
}
