import prisma from './prisma';
import {
    sendPaymentSuccessEmail,
    sendOrderConfirmationEmail,
    sendOrderCancelledEmail,
    sendReviewRequestEmail,
    sendLowStockAlert,
    sendOrderShippedEmail,
    sendOrderDeliveredEmail
} from './email';

/**
 * Auto-cancel unpaid orders after 24 hours
 */
export async function autoCancelUnpaidOrders() {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find pending payment orders older than 24 hours
        const expiredOrders = await prisma.orders.findMany({
            where: {
                status: 'PENDING_PAYMENT',
                createdAt: {
                    lt: twentyFourHoursAgo,
                },
            },
            include: {
                payment: true,
            },
        });

        console.log(`🔍 Found ${expiredOrders.length} expired unpaid orders`);

        let cancelledCount = 0;

        for (const order of expiredOrders) {
            // Update order status
            await prisma.orders.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' },
            });

            // Update payment status if exists
            if (order.payment) {
                await prisma.payments.update({
                    where: { id: order.payment.id },
                    data: { status: 'EXPIRED' },
                });
            }

            console.log(`❌ Auto-cancelled order: ${order.orderNumber}`);
            cancelledCount++;

            // Send cancellation email notification
            sendOrderCancelledEmail(order).catch(error => {
                console.error('Failed to send cancellation email:', error);
            });
        }

        console.log(`✅ Auto-cancelled ${cancelledCount} orders`);
        return { success: true, cancelledCount };
    } catch (error) {
        console.error('Auto-cancel error:', error);
        throw error;
    }
}

/**
 * Auto-complete delivered orders after 7 days
 */
export async function autoCompleteDeliveredOrders() {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Find delivered orders older than 7 days
        const deliveredOrders = await prisma.orders.findMany({
            where: {
                status: 'DELIVERED',
                updatedAt: {
                    lt: sevenDaysAgo,
                },
            },
            include: {
                shipment: true,
            },
        });

        console.log(`🔍 Found ${deliveredOrders.length} long-delivered orders`);

        let completedCount = 0;

        for (const order of deliveredOrders) {
            // Check if shipment was delivered at least 7 days ago
            if (order.shipment?.deliveredAt) {
                const deliveredDate = new Date(order.shipment.deliveredAt);
                const daysSinceDelivery = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

                if (daysSinceDelivery >= 7) {
                    await prisma.orders.update({
                        where: { id: order.id },
                        data: { status: 'COMPLETED' },
                    });

                    console.log(`✅ Auto-completed order: ${order.orderNumber}`);
                    completedCount++;

                    // Send review request email
                    sendReviewRequestEmail(order).catch(error => {
                        console.error('Failed to send review request email:', error);
                    });
                }
            }
        }

        console.log(`✅ Auto-completed ${completedCount} orders`);
        return { success: true, completedCount };
    } catch (error) {
        console.error('Auto-complete error:', error);
        throw error;
    }
}

/**
 * Check for low stock products
 */
export async function checkLowStock(threshold = 10) {
    try {
        const lowStockProducts = await prisma.products.findMany({
            where: {
                stock: {
                    lte: threshold,
                },
                status: 'ACTIVE',
            },
            select: {
                id: true,
                name: true,
                stock: true,
                slug: true,
            },
        });

        console.log(`⚠️ Found ${lowStockProducts.length} low stock products`);

        // Send low stock alert to admin
        if (lowStockProducts.length > 0) {
            sendLowStockAlert(lowStockProducts).catch(error => {
                console.error('Failed to send low stock alert:', error);
            });
        }

        return { success: true, lowStockProducts };
    } catch (error) {
        console.error('Check low stock error:', error);
        throw error;
    }
}

/**
 * Process order status change and send notifications
 */
export async function processOrderStatusChange(orderId, newStatus) {
    try {
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { name: true, email: true } },
                items: true,
            },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Update order status
        await prisma.orders.update({
            where: { id: orderId },
            data: { status: newStatus },
        });

        console.log(`📦 Order ${order.orderNumber} status changed to ${newStatus}`);

        // Send appropriate email based on status
        switch (newStatus) {
            case 'PAID':
                await sendPaymentSuccessEmail(order);
                break;
            case 'PROCESSING':
                // await sendOrderProcessingEmail(order);
                break;
            case 'SHIPPED':
                sendOrderShippedEmail(order, order.shipment?.trackingNumber).catch(error => {
                    console.error('Failed to send shipped email:', error);
                });
                break;
            case 'DELIVERED':
                sendOrderDeliveredEmail(order).catch(error => {
                    console.error('Failed to send delivered email:', error);
                });
                break;
            case 'COMPLETED':
                sendReviewRequestEmail(order).catch(error => {
                    console.error('Failed to send review request:', error);
                });
                break;
            default:
                console.log(`No email template for status: ${newStatus}`);
        }

        return { success: true, order };
    } catch (error) {
        console.error('Process status change error:', error);
        throw error;
    }
}

/**
 * Main cron job function - run this periodically
 */
export async function runOrderAutomation() {
    console.log('🤖 Running order automation tasks...');

    try {
        // Run all automation tasks
        const [cancelResult, completeResult, stockResult] = await Promise.allSettled([
            autoCancelUnpaidOrders(),
            autoCompleteDeliveredOrders(),
            checkLowStock(),
        ]);

        console.log('✅ Order automation completed');

        return {
            success: true,
            results: {
                cancelled: cancelResult.status === 'fulfilled' ? cancelResult.value : null,
                completed: completeResult.status === 'fulfilled' ? completeResult.value : null,
                lowStock: stockResult.status === 'fulfilled' ? stockResult.value : null,
            },
        };
    } catch (error) {
        console.error('Order automation error:', error);
        throw error;
    }
}
