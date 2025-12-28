import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth, assertUserCanTransact } from '@/lib/auth';


// Helper to get authenticated user
async function getAuthUser(request) {
    const auth = await verifyAuth(request);
    if (!auth.success) return null;
    return { userId: auth.user.id, ...auth.user };
}

// GET /api/cart - Get user's cart
export async function GET(request) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cartItems = await prisma.carts.findMany({
            where: { userId: user.userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        basePrice: true,
                        salePrice: true,
                        stock: true,
                        images: true,
                        status: true,
                    },
                },
                variant: {
                    select: {
                        id: true,
                        name: true,
                        stock: true,
                        priceAdjustment: true,
                    },
                },
            },
        });

        // Filter out unavailable products
        const validItems = cartItems.filter(item => item.product.status === 'ACTIVE');

        return NextResponse.json({ cart: validItems });
    } catch (error) {
        console.error('Get cart error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data keranjang' }, { status: 500 });
    }
}

// POST /api/cart - Add item to cart
export async function POST(request) {
    try {
        // ROLE BOUNDARY CHECK - Block ADMIN/SYSTEM from transactions
        const transactCheck = await assertUserCanTransact(request);
        if (!transactCheck.canTransact) {
            return NextResponse.json({ error: transactCheck.error }, { status: 403 });
        }

        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Silakan login terlebih dahulu' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, variantId, quantity = 1 } = body;

        // Validate product
        const product = await prisma.products.findUnique({
            where: { id: productId },
            include: { variants: true },
        });

        if (!product || product.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Produk tidak tersedia' }, { status: 400 });
        }

        // Check stock
        const variant = variantId ? product.variants.find(v => v.id === variantId) : null;
        const availableStock = variant ? variant.stock : product.stock;

        if (availableStock < quantity) {
            return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 });
        }

        // Upsert cart item
        const existingItem = await prisma.carts.findFirst({
            where: {
                userId: user.userId,
                productId,
                variantId: variantId || null,
            },
        });

        let cartItem;
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > availableStock) {
                return NextResponse.json({ error: 'Melebihi stok tersedia' }, { status: 400 });
            }
            cartItem = await prisma.carts.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            cartItem = await prisma.carts.create({
                data: {
                    userId: user.userId,
                    productId,
                    variantId: variantId || null,
                    quantity,
                },
            });
        }

        return NextResponse.json({
            message: 'Produk ditambahkan ke keranjang',
            cartItem,
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        return NextResponse.json({ error: 'Gagal menambahkan ke keranjang' }, { status: 500 });
    }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request) {
    try {
        // ROLE BOUNDARY CHECK - Block ADMIN/SYSTEM from transactions
        const transactCheck = await assertUserCanTransact(request);
        if (!transactCheck.canTransact) {
            return NextResponse.json({ error: transactCheck.error }, { status: 403 });
        }

        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { cartItemId, quantity } = body;

        if (quantity < 1) {
            return NextResponse.json({ error: 'Quantity minimal 1' }, { status: 400 });
        }

        const cartItem = await prisma.carts.findFirst({
            where: { id: cartItemId, userId: user.userId },
            include: { product: true, variant: true },
        });

        if (!cartItem) {
            return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
        }

        const availableStock = cartItem.variant ? cartItem.variant.stock : cartItem.product.stock;
        if (quantity > availableStock) {
            return NextResponse.json({ error: 'Melebihi stok tersedia' }, { status: 400 });
        }

        await prisma.carts.update({
            where: { id: cartItemId },
            data: { quantity },
        });

        return NextResponse.json({ message: 'Keranjang diperbarui' });
    } catch (error) {
        console.error('Update cart error:', error);
        return NextResponse.json({ error: 'Gagal memperbarui keranjang' }, { status: 500 });
    }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request) {
    try {
        // ROLE BOUNDARY CHECK - Block ADMIN/SYSTEM from transactions
        const transactCheck = await assertUserCanTransact(request);
        if (!transactCheck.canTransact) {
            return NextResponse.json({ error: transactCheck.error }, { status: 403 });
        }

        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const cartItemId = searchParams.get('id');

        if (!cartItemId) {
            // Clear all cart
            await prisma.carts.deleteMany({
                where: { userId: user.userId },
            });
            return NextResponse.json({ message: 'Keranjang dikosongkan' });
        }

        await prisma.carts.deleteMany({
            where: { id: cartItemId, userId: user.userId },
        });

        return NextResponse.json({ message: 'Item dihapus dari keranjang' });
    } catch (error) {
        console.error('Delete cart error:', error);
        return NextResponse.json({ error: 'Gagal menghapus dari keranjang' }, { status: 500 });
    }
}

