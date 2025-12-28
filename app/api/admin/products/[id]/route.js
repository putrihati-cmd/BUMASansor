import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/admin/products/[id] - Get single product
export async function GET(request, { params }) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.users.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const product = await prisma.products.findUnique({
            where: { id: params.id },
            include: {
                categories: { select: { id: true, name: true } },
                variants: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({
            products: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                category_id: product.category_id,
                category: product.categories,
                base_price: Number(product.base_price),
                sale_price: product.sale_price ? Number(product.sale_price) : null,
                stock: product.stock,
                weight: product.weight,
                dimensions: product.dimensions,
                images: product.images,
                status: product.status,
                is_featured: product.is_featured,
                variants: product.variants.map(v => ({
                    id: v.id,
                    name: v.name,
                    sku: v.sku,
                    stock: v.stock,
                    priceAdjustment: Number(v.priceAdjustment),
                })),
            },
        });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
    }
}

// PATCH /api/admin/products/[id] - Update product
export async function PATCH(request, { params }) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.users.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            description,
            categoryId,
            basePrice,
            salePrice,
            stock,
            weight,
            dimensions,
            images,
            status,
            isFeatured,
            variants,
        } = body;

        // Update product
        const product = await prisma.products.update({
            where: { id: params.id },
            data: {
                name,
                description,
                category_id: categoryId,
                base_price: basePrice,
                sale_price: salePrice || null,
                stock,
                weight,
                dimensions,
                images,
                status,
                is_featured: isFeatured,
            },
        });

        // Handle variants update
        if (variants) {
            // Delete existing variants
            await prisma.product_variants.deleteMany({
                where: { product_id: params.id },
            });

            // Create new variants
            if (variants.length > 0) {
                await prisma.product_variants.createMany({
                    data: variants.map(v => ({
                        product_id: params.id,
                        name: v.name,
                        sku: v.sku,
                        stock: v.stock,
                        priceAdjustment: v.priceAdjustment,
                    })),
                });
            }
        }

        return NextResponse.json({
            message: 'Produk berhasil diupdate',
            products: {
                id: product.id,
                name: product.name,
                slug: product.slug,
            },
        });
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json({ error: 'Gagal mengupdate produk' }, { status: 500 });
    }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(request, { params }) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.users.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.products.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            message: 'Produk berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
    }
}
