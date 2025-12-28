/**
 * AI Inventory Monitoring Library
 * 
 * Provides AI-powered inventory insights:
 * - Low stock predictions
 * - Sales velocity analysis
 * - Restock recommendations
 * - Anomaly detection
 */

import prisma from './prisma';

/**
 * Get AI-powered inventory insights for admin dashboard
 */
export async function getInventoryInsights() {
    try {
        const insights = {
            lowStockAlerts: [],
            restockRecommendations: [],
            salesVelocity: [],
            anomalies: [],
            summary: {}
        };

        // 1. Low Stock Alerts
        const lowStockProducts = await prisma.products.findMany({
            where: {
                status: 'ACTIVE',
                stock: { lte: 10 }
            },
            include: {
                category: true,
                _count: {
                    select: { orderItems: true }
                }
            },
            orderBy: { stock: 'asc' },
            take: 10
        });

        insights.lowStockAlerts = lowStockProducts.map(product => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            stock: product.stock,
            category: product.category?.name,
            salesCount: product._count.orderItems,
            urgency: product.stock === 0 ? 'critical' : product.stock <= 3 ? 'high' : 'medium',
            message: product.stock === 0
                ? '🔴 Stok habis! Segera restock'
                : product.stock <= 3
                    ? `🟠 Stok hampir habis (${product.stock} tersisa)`
                    : `🟡 Stok rendah (${product.stock} tersisa)`
        }));

        // 2. Sales Velocity Analysis (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesData = await prisma.order_items.groupBy({
            by: ['productId'],
            where: {
                order: {
                    createdAt: { gte: thirtyDaysAgo },
                    status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] }
                }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10
        });

        const productIds = salesData.map(s => s.productId);
        const products = await prisma.products.findMany({
            where: { id: { in: productIds } },
            include: { category: true }
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        insights.salesVelocity = salesData.map(sale => {
            const product = productMap.get(sale.productId);
            const soldQuantity = sale._sum.quantity || 0;
            const dailyAverage = Math.round((soldQuantity / 30) * 10) / 10;
            const daysUntilEmpty = product?.stock
                ? Math.round(product.stock / (dailyAverage || 0.1))
                : null;

            return {
                productId: sale.productId,
                productName: product?.name || 'Unknown',
                category: product?.category?.name,
                soldLast30Days: soldQuantity,
                dailyAverage,
                currentStock: product?.stock || 0,
                daysUntilEmpty,
                velocity: dailyAverage >= 3 ? 'fast' : dailyAverage >= 1 ? 'medium' : 'slow'
            };
        });

        // 3. Restock Recommendations
        insights.restockRecommendations = insights.salesVelocity
            .filter(item => item.daysUntilEmpty !== null && item.daysUntilEmpty <= 14)
            .map(item => ({
                productId: item.productId,
                productName: item.productName,
                currentStock: item.currentStock,
                daysUntilEmpty: item.daysUntilEmpty,
                recommendedRestock: Math.ceil(item.dailyAverage * 30), // 30 days supply
                urgency: item.daysUntilEmpty <= 3 ? 'urgent' : item.daysUntilEmpty <= 7 ? 'soon' : 'planned',
                message: item.daysUntilEmpty <= 3
                    ? `⚡ Restock segera! Habis dalam ${item.daysUntilEmpty} hari`
                    : item.daysUntilEmpty <= 7
                        ? `📦 Perlu restock minggu ini`
                        : `📋 Jadwalkan restock dalam 2 minggu`
            }))
            .slice(0, 5);

        // 4. Inventory Anomalies (sudden changes)
        const recentLogs = await prisma.inventoryLog.findMany({
            where: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Group by product and detect anomalies
        const productChanges = new Map();
        for (const log of recentLogs) {
            if (!productChanges.has(log.productId)) {
                productChanges.set(log.productId, { total: 0, count: 0, logs: [] });
            }
            const data = productChanges.get(log.productId);
            data.total += Math.abs(log.quantity);
            data.count++;
            data.logs.push(log);
        }

        // Detect unusual activity (more than 10 transactions or large quantity changes)
        for (const [productId, data] of productChanges) {
            if (data.count >= 5 || data.total >= 20) {
                const product = await prisma.products.findUnique({
                    where: { id: productId },
                    select: { name: true }
                });

                if (product) {
                    insights.anomalies.push({
                        productId,
                        productName: product.name,
                        transactionCount: data.count,
                        totalQuantityChange: data.total,
                        message: data.count >= 5
                            ? '📊 Aktivitas stok tinggi (banyak transaksi)'
                            : '📈 Perubahan stok besar terdeteksi'
                    });
                }
            }
        }

        // 5. Summary Stats
        const totalProducts = await prisma.products.count({ where: { status: 'ACTIVE' } });
        const outOfStockCount = await prisma.products.count({
            where: { status: 'ACTIVE', stock: 0 }
        });
        const lowStockCount = await prisma.products.count({
            where: { status: 'ACTIVE', stock: { gt: 0, lte: 10 } }
        });
        const totalInventoryValue = await prisma.products.aggregate({
            where: { status: 'ACTIVE' },
            _sum: {
                stock: true
            }
        });

        insights.summary = {
            totalProducts,
            outOfStock: outOfStockCount,
            lowStock: lowStockCount,
            healthyStock: totalProducts - outOfStockCount - lowStockCount,
            stockHealthPercentage: Math.round(
                ((totalProducts - outOfStockCount - lowStockCount) / totalProducts) * 100
            ),
            totalUnits: totalInventoryValue._sum.stock || 0
        };

        return {
            success: true,
            insights,
            generatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('[AI Inventory] Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get quick stats for dashboard widget
 */
export async function getQuickInventoryStats() {
    try {
        const [outOfStock, lowStock, totalActive] = await Promise.all([
            prisma.products.count({ where: { status: 'ACTIVE', stock: 0 } }),
            prisma.products.count({ where: { status: 'ACTIVE', stock: { gt: 0, lte: 10 } } }),
            prisma.products.count({ where: { status: 'ACTIVE' } })
        ]);

        return {
            outOfStock,
            lowStock,
            healthy: totalActive - outOfStock - lowStock,
            total: totalActive,
            alerts: outOfStock + lowStock
        };
    } catch (error) {
        console.error('[Quick Inventory Stats] Error:', error);
        return null;
    }
}

const exports = {
    getInventoryInsights,
    getQuickInventoryStats
};


export default exports;
