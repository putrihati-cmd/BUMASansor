import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth, assertUserCanTransact } from '@/lib/auth';

import { generateOrderNumber } from '@/lib/utils';

import { reduceStock } from '@/lib/inventory';

import { checkRateLimit } from '@/lib/rateLimit';

import { sendOrderNotification } from '@/lib/whatsapp';

import { sendOrderConfirmationSMTP } from '@/lib/smtp';


// Helper to verify token and get user
async function getAuthUser(request) {
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return null;
    }
    return { userId: auth.user.id, role: auth.user.role, email: auth.user.email };
}

// GET /api/orders - Get user's orders
export async function GET(request) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');

        const where = { userId: user.userId };
        if (status) where.status = status;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    items: {
                        include: {
                            product: {
                                select: { name: true, images: true, slug: true },
                            },
                        },
                    },
                    payment: true,
                    shipment: true,
                },
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            orders,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
    }
}

// POST /api/orders - Create new order (SUPPORTS GUEST CHECKOUT)
export async function POST(request) {
    try {
        // ROLE BOUNDARY CHECK - Block ADMIN/SYSTEM from transactions
        const transactCheck = await assertUserCanTransact(request);
        if (!transactCheck.canTransact) {
            return NextResponse.json({ error: transactCheck.error }, { status: 403 });
        }

        // Try to get authenticated user (optional for guest checkout)
        const user = await getAuthUser(request);

        const body = await request.json();
        const {
            items,
            addressId,
            shippingMethod,
            courierService,
            paymentMethod,
            notes,
            voucherCode,
            idempotencyKey,
            // Guest checkout fields (required if not authenticated)
            guestEmail,
            guestPhone,
            guestName,
            guestAddress,
            // Authenticated user manual address entry
            shippingAddress
        } = body;

        // If no authenticated user, require guest information
        if (!user) {
            if (!guestEmail || !guestPhone || !guestName || !guestAddress) {
                return NextResponse.json({
                    error: 'Guest checkout memerlukan email, phone, name, dan address'
                }, { status: 400 });
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(guestEmail)) {
                return NextResponse.json({
                    error: 'Format email tidak valid'
                }, { status: 400 });
            }
        }

        // Rate limiting - prevent order spam (5 orders per minute max)
        try {
            await checkRateLimit(request, 'payment'); // Use strict payment limiter
        } catch (error) {
            if (error.name === 'RateLimitError') {
                return NextResponse.json({
                    error: 'Terlalu banyak permintaan. Silakan tunggu sebentar.'
                }, { status: 429 });
            }
        }

        // ============================================================
        // IDEMPOTENCY CHECK - Prevent duplicate order creation
        // Client should send unique idempotencyKey per checkout
        // ============================================================
        if (idempotencyKey) {
            const where = {
                idempotencyKey,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
            };

            // Add userId filter only if user is authenticated
            if (user) {
                where.userId = user.userId;
            }

            const existingOrder = await prisma.order.findFirst({
                where,
                include: {
                    items: true,
                    payment: true,
                    shipment: true
                }
            });

            if (existingOrder) {
                console.log(`[IDEMPOTENCY] Returning existing order ${existingOrder.orderNumber} for key ${idempotencyKey}`);
                return NextResponse.json({
                    message: 'Order sudah dibuat sebelumnya',
                    duplicate: true,
                    order: existingOrder
                }, { status: 200 }); // Return 200 to stop client retry
            }
        }

        // Validate items
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 });
        }

        // Validate address - different for authenticated vs guest users
        let address;
        if (user) {
            // Authenticated user - support both saved addressId and manual shippingAddress
            if (addressId) {
                // Using saved address from database
                address = await prisma.address.findFirst({
                    where: { id: addressId, userId: user.userId },
                });
                if (!address) {
                    return NextResponse.json({ error: 'Alamat tidak valid' }, { status: 400 });
                }
            } else if (shippingAddress) {
                // Using manual address entry (for authenticated users without saved addresses)
                if (!shippingAddress.city || !shippingAddress.address) {
                    return NextResponse.json({
                        error: 'Alamat pengiriman tidak lengkap'
                    }, { status: 400 });
                }
                // Create a pseudo-address object for authenticated user with manual entry
                address = {
                    id: null, // No database address
                    recipientName: shippingAddress.recipientName,
                    phone: shippingAddress.phone,
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    province: shippingAddress.province || '',
                    postalCode: shippingAddress.postalCode || '',
                    label: 'MANUAL'
                };
            } else {
                return NextResponse.json({ error: 'Alamat pengiriman diperlukan' }, { status: 400 });
            }
        } else {
            // Guest user - use guestAddress from request
            if (!guestAddress || !guestAddress.city || !guestAddress.address) {
                return NextResponse.json({
                    error: 'Alamat pengiriman tidak lengkap'
                }, { status: 400 });
            }
            // Create a pseudo-address object for guest
            address = {
                id: null, // No database address for guest
                recipientName: guestName,
                phone: guestPhone,
                address: guestAddress.address,
                city: guestAddress.city,
                province: guestAddress.province || '',
                postalCode: guestAddress.postalCode || '',
                label: 'GUEST'
            };
        }

        // Get products and calculate prices
        let subtotal = 0;
        const orderItems = [];
        const flashSaleReservations = []; // Track flash sale reservations

        const now = new Date();

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                include: {
                    variants: true,
                    flashSales: {
                        where: {
                            flashSale: {
                                status: 'ACTIVE',
                                startTime: { lte: now },
                                endTime: { gte: now }
                            }
                        }
                    }
                },
            });

            if (!product || product.status !== 'ACTIVE') {
                return NextResponse.json({ error: `Produk ${item.productId} tidak tersedia` }, { status: 400 });
            }

            const variant = item.variantId
                ? product.variants.find(v => v.id === item.variantId)
                : null;

            const stock = variant ? variant.stock : product.stock;
            if (stock < item.quantity) {
                return NextResponse.json({ error: `Stok ${product.name} tidak mencukupi` }, { status: 400 });
            }

            let price = product.salePrice || product.basePrice;
            let isFlashSale = false;

            // CHECK FLASH SALE - Will be reserved atomically in transaction
            if (product.flashSales.length > 0) {
                const fsItem = product.flashSales[0];

                // Mark for atomic reservation (will check quota inside transaction)
                flashSaleReservations.push({
                    flashSaleProductId: fsItem.id,
                    productId: product.id,
                    quantity: item.quantity,
                    salePrice: fsItem.salePrice
                });

                price = fsItem.salePrice;
                isFlashSale = true;
            }

            const itemSubtotal = Number(price) * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                productId: product.id,
                variantId: variant?.id || null,
                productName: product.name,
                variantName: variant?.name || null,
                quantity: item.quantity,
                priceAtPurchase: price,
                subtotal: itemSubtotal,
            });
        }

        // Apply voucher discount
        let discount = 0;
        if (voucherCode) {
            const voucher = await prisma.voucher.findUnique({
                where: { code: voucherCode },
            });
            if (voucher && voucher.status === 'ACTIVE' &&
                new Date() >= voucher.validFrom && new Date() <= voucher.validUntil &&
                subtotal >= Number(voucher.minPurchase)) {
                if (voucher.type === 'PERCENTAGE') {
                    discount = subtotal * (Number(voucher.value) / 100);
                    if (voucher.maxDiscount) {
                        discount = Math.min(discount, Number(voucher.maxDiscount));
                    }
                } else if (voucher.type === 'FIXED_AMOUNT') {
                    discount = Number(voucher.value);
                }
            }
        }

        // Calculate shipping (simplified - should integrate with shipping API)
        const shippingCost = 15000; // Default shipping cost

        // Calculate tax (PPN 11%)
        const tax = Math.round((subtotal - discount) * 0.11);

        // Calculate total
        const total = subtotal - discount + shippingCost + tax;

        // Create order with transaction-safe inventory
        const order = await prisma.$transaction(async (tx) => {
            // Prepare order data (different for authenticated vs guest)
            const orderData = {
                orderNumber: generateOrderNumber(),
                userId: user ? user.userId : null, // NULL for guest checkout
                addressId: address.id, // Will be null for guests
                subtotal,
                shippingCost,
                discount,
                tax,
                total,
                paymentMethod,
                shippingMethod,
                courierService,
                notes,
                idempotencyKey, // Store for future duplicate detection
                status: 'PENDING_PAYMENT', // Start at PENDING_PAYMENT
                items: {
                    create: orderItems,
                },
            };

            // Add guest contact info if guest checkout
            if (!user) {
                orderData.guestEmail = guestEmail;
                orderData.guestPhone = guestPhone;
                orderData.guestName = guestName;
            }

            // Create order
            const newOrder = await tx.order.create({
                data: orderData,
                include: {
                    items: true,
                    address: true,
                },
            });

            // Create payment record with INIT status
            await tx.payment.create({
                data: {
                    orderId: newOrder.id,
                    paymentMethod,
                    amount: total,
                    status: 'INIT', // Initial payment status
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            });

            // Create shipment record
            await tx.shipment.create({
                data: {
                    orderId: newOrder.id,
                    courier: shippingMethod,
                    serviceType: courierService,
                    status: 'PENDING',
                },
            });

            // ============================================================
            // STOCK REDUCTION REMOVED
            // Stock will only be reduced when order becomes PAID (via payment webhook)
            // This follows the requirement: "Stock dikurangi HANYA saat PAID"
            // ============================================================

            // UPDATE FLASH SALE QUOTA
            for (const fsReserve of flashSaleReservations) {
                await tx.flashSaleProduct.update({
                    where: { id: fsReserve.flashSaleProductId },
                    data: { soldCount: { increment: fsReserve.quantity } }
                });
            }

            // Update voucher usage
            if (voucherCode && discount > 0) {
                await tx.voucher.update({
                    where: { code: voucherCode },
                    data: { usedCount: { increment: 1 } },
                });
            }

            return newOrder;
        });

        // Send WhatsApp notification for new order (fire and forget)
        sendOrderNotification(order).catch(err => {
            console.error('[WhatsApp] Order notification failed:', err);
        });

        // Send email notification for new order (fire and forget)
        sendOrderConfirmationSMTP(order).catch(err => {
            console.error('[Email] Order confirmation failed:', err);
        });

        return NextResponse.json({
            message: 'Pesanan berhasil dibuat! Silakan lakukan pembayaran.',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({
            error: 'Gagal membuat pesanan'
        }, { status: 500 });
    }
}

