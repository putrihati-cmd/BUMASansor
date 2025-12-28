/**
 * STOCK MANAGER - Production-Grade Inventory Management
 * 
 * Prevents race conditions using:
 * 1. Database transactions with Serializable isolation
 * 2. Atomic stock updates with condition checks
 * 3. Stock reservation pattern (temporary holds)
 * 4. Audit trail with StockMovement
 * 
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/transactions
 */

const { prisma } = require('./prisma');
const { Prisma } = require('@prisma/client');

class StockManager {

    /**
     * Reserve stock for an order (at checkout)
     * Uses database-level atomic operations to prevent race conditions
     * 
     * @param {string} orderId - Order ID
     * @param {Array<{productId: string, quantity: number}>} items - Items to reserve
     * @returns {Promise<{success: boolean, errors?: string[]}>}
     */
    async reserveStock(orderId, items) {
        const errors = [];
        const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        try {
            // Use transaction with serializable isolation level
            await prisma.$transaction(
                async (tx) => {
                    for (const item of items) {
                        // Lock the product row for update
                        const product = await tx.product.findUnique({
                            where: { id: item.productId },
                            select: {
                                id: true,
                                name: true,
                                stock: true,
                                stockReserved: true,
                                oversellAllowed: true
                            }
                        });

                        if (!product) {
                            errors.push(`Product ${item.productId} not found`);
                            continue;
                        }

                        const availableStock = product.stock - product.stockReserved;

                        // Check stock availability
                        if (availableStock < item.quantity && !product.oversellAllowed) {
                            errors.push(
                                `Stok tidak cukup untuk ${product.name}. Tersedia: ${availableStock}, Diminta: ${item.quantity}`
                            );
                            continue;
                        }

                        // Atomic update: increment reserved stock
                        // This prevents race condition by checking stock availability in WHERE clause
                        const updateResult = await tx.product.updateMany({
                            where: {
                                id: item.productId,
                                // Double-check condition to prevent race condition
                                stock: { gte: product.stockReserved + item.quantity }
                            },
                            data: {
                                stockReserved: { increment: item.quantity }
                            }
                        });

                        // If no rows updated, stock was taken by someone else
                        if (updateResult.count === 0) {
                            errors.push(`Stok tidak tersedia untuk ${product.name} (pembelian bersamaan)`);
                            continue;
                        }

                        // Create reservation record
                        await tx.stockReservation.create({
                            data: {
                                productId: item.productId,
                                orderId,
                                quantity: item.quantity,
                                status: 'active',
                                expiresAt: reservationExpiry
                            }
                        });

                        // Log stock movement
                        await tx.stockMovement.create({
                            data: {
                                productId: item.productId,
                                type: 'reservation',
                                quantity: -item.quantity,
                                reference: orderId,
                                stockBefore: availableStock,
                                stockAfter: availableStock - item.quantity,
                                performedBy: 'system'
                            }
                        });
                    }

                    // If any errors, rollback entire transaction
                    if (errors.length > 0) {
                        throw new Error('Stock reservation failed');
                    }
                },
                {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                    timeout: 10000 // 10 second timeout
                }
            );

            return { success: true };

        } catch (error) {
            console.error('Stock reservation error:', error);
            return { success: false, errors: errors.length > 0 ? errors : ['Gagal memesan stok'] };
        }
    }

    /**
     * Commit reservation to actual sale (when payment confirmed)
     * 
     * @param {string} orderId - Order ID
     */
    async commitReservation(orderId) {
        await prisma.$transaction(async (tx) => {
            const reservations = await tx.stockReservation.findMany({
                where: { orderId, status: 'active' }
            });

            for (const reservation of reservations) {
                const product = await tx.product.findUnique({
                    where: { id: reservation.productId },
                    select: { stock: true, stockReserved: true }
                });

                if (!product) continue;

                // Deduct from total stock and release from reserved
                await tx.product.update({
                    where: { id: reservation.productId },
                    data: {
                        stock: { decrement: reservation.quantity },
                        stockReserved: { decrement: reservation.quantity }
                    }
                });

                // Mark reservation as committed
                await tx.stockReservation.update({
                    where: { id: reservation.id },
                    data: {
                        status: 'committed',
                        committedAt: new Date()
                    }
                });

                // Log movement
                await tx.stockMovement.create({
                    data: {
                        productId: reservation.productId,
                        type: 'sale',
                        quantity: -reservation.quantity,
                        reference: orderId,
                        stockBefore: product.stock,
                        stockAfter: product.stock - reservation.quantity,
                        performedBy: 'system'
                    }
                });
            }
        });
    }

    /**
     * Release reservation (payment expired or order cancelled)
     * 
     * @param {string} orderId - Order ID
     * @param {string} [reason] - Reason for release
     */
    async releaseReservation(orderId, reason) {
        await prisma.$transaction(async (tx) => {
            const reservations = await tx.stockReservation.findMany({
                where: { orderId, status: 'active' }
            });

            for (const reservation of reservations) {
                const product = await tx.product.findUnique({
                    where: { id: reservation.productId },
                    select: { stock: true, stockReserved: true }
                });

                if (!product) continue;

                const availableStock = product.stock - product.stockReserved;

                // Return reserved stock to available pool
                await tx.product.update({
                    where: { id: reservation.productId },
                    data: {
                        stockReserved: { decrement: reservation.quantity }
                    }
                });

                // Mark reservation as released
                await tx.stockReservation.update({
                    where: { id: reservation.id },
                    data: {
                        status: 'released',
                        releasedAt: new Date()
                    }
                });

                // Log movement
                await tx.stockMovement.create({
                    data: {
                        productId: reservation.productId,
                        type: 'release',
                        quantity: reservation.quantity,
                        reference: orderId,
                        reason: reason || 'Order cancelled/expired',
                        stockBefore: availableStock,
                        stockAfter: availableStock + reservation.quantity,
                        performedBy: 'system'
                    }
                });
            }
        });
    }

    /**
     * Auto-release expired reservations (run via cron)
     * 
     * @returns {Promise<number>} Number of released reservations
     */
    async releaseExpiredReservations() {
        const expiredReservations = await prisma.stock_reservations.findMany({
            where: {
                status: 'active',
                expiresAt: { lte: new Date() }
            },
            include: { order: true }
        });

        for (const reservation of expiredReservations) {
            await this.releaseReservation(
                reservation.orderId,
                'Reservation expired'
            );

            // Cancel the order if still pending payment
            if (reservation.order.status === 'PENDING_PAYMENT') {
                await prisma.orders.update({
                    where: { id: reservation.orderId },
                    data: { status: 'CANCELLED' }
                });
            }
        }

        return expiredReservations.length;
    }

    /**
     * Get real-time available stock (accounting for reservations)
     * 
     * @param {string} productId - Product ID
     * @returns {Promise<number>} Available stock
     */
    async getAvailableStock(productId) {
        const product = await prisma.products.findUnique({
            where: { id: productId },
            select: {
                stock: true,
                stockReserved: true
            }
        });

        if (!product) return 0;

        return Math.max(0, product.stock - product.stockReserved);
    }

    /**
     * Check if product can be purchased (before adding to cart)
     * 
     * @param {string} productId - Product ID
     * @param {number} quantity - Desired quantity
     * @returns {Promise<boolean>} Whether product can be purchased
     */
    async canPurchase(productId, quantity) {
        const available = await this.getAvailableStock(productId);
        return available >= quantity;
    }

    /**
     * Reconcile stock discrepancies (run daily via cron)
     * Checks if stockReserved matches actual active reservations
     * 
     * @returns {Promise<Array>} List of discrepancies found
     */
    async reconcileStock() {
        const products = await prisma.products.findMany({
            include: {
                stockReservations: {
                    where: { status: 'active' }
                }
            }
        });

        const discrepancies = [];

        for (const product of products) {
            const calculatedReserved = product.stockReservations.reduce(
                (sum, r) => sum + r.quantity,
                0
            );

            if (calculatedReserved !== product.stockReserved) {
                discrepancies.push({
                    productId: product.id,
                    name: product.name,
                    expected: calculatedReserved,
                    actual: product.stockReserved,
                    difference: product.stockReserved - calculatedReserved
                });

                // Auto-fix discrepancy
                await prisma.products.update({
                    where: { id: product.id },
                    data: { stockReserved: calculatedReserved }
                });

                // Log the correction
                await prisma.stock_movements.create({
                    data: {
                        productId: product.id,
                        type: 'adjustment',
                        quantity: 0,
                        reason: `Stock reconciliation: fixed reserved stock from ${product.stockReserved} to ${calculatedReserved}`,
                        stockBefore: product.stock - product.stockReserved,
                        stockAfter: product.stock - calculatedReserved,
                        performedBy: 'system'
                    }
                });
            }
        }

        return discrepancies;
    }

    /**
     * Get low stock products
     * 
     * @returns {Promise<Array>} Products below threshold
     */
    async getLowStockProducts() {
        return await prisma.products.findMany({
            where: {
                stock: {
                    lte: prisma.raw('low_stock_threshold')
                },
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,
                stock: true,
                stockReserved: true,
                lowStockThreshold: true
            }
        });
    }
}

const stockManager = new StockManager();

module.exports = { stockManager, StockManager };
