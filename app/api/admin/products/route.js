import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';

import { slugify } from '@/lib/utils';


// GET /api/admin/products - Get all products for admin
export async function GET(request) {
    try {
        // Verify admin access
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Build where clause
        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (category) {
            where.categoryId = category;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get products with pagination
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    category: {
                        select: { id: true, name: true },
                    },
                    variants: true,
                    _count: {
                        select: { reviews: true, orderItems: true },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        // Format products
        const formattedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            category: product.category?.name || '-',
            categoryId: product.categoryId,
            basePrice: Number(product.basePrice),
            salePrice: product.salePrice ? Number(product.salePrice) : null,
            stock: product.stock,
            variantsCount: product.variants.length,
            totalVariantStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
            images: product.images,
            status: product.status,
            isFeatured: product.isFeatured,
            reviewCount: product._count.reviews,
            soldCount: product._count.orderItems,
            createdAt: product.createdAt,
        }));

        return NextResponse.json({
            products: formattedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin products error:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data produk' },
            { status: 500 }
        );
    }
}

// POST /api/admin/products - Create new product
export async function POST(request) {
    try {
        // Verify admin access
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
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

        // Validation
        if (!name || !description || !categoryId || !basePrice) {
            return NextResponse.json(
                { error: 'Nama, deskripsi, kategori, dan harga dasar wajib diisi' },
                { status: 400 }
            );
        }

        // Generate slug
        let slug = slugify(name);

        // Check for duplicate slug
        const existingProduct = await prisma.product.findUnique({
            where: { slug },
        });

        if (existingProduct) {
            slug = `${slug}-${Date.now()}`;
        }

        // Create product with variants
        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                categoryId,
                basePrice,
                salePrice: salePrice || null,
                stock: stock || 0,
                weight: weight || 0,
                dimensions: dimensions || null,
                images: images || [],
                status: status || 'ACTIVE',
                isFeatured: isFeatured || false,
                variants: variants?.length > 0 ? {
                    create: variants.map(v => ({
                        name: v.name,
                        sku: v.sku || `${slug}-${slugify(v.name)}`,
                        priceAdjustment: v.priceAdjustment || 0,
                        stock: v.stock || 0,
                    })),
                } : undefined,
            },
            include: {
                category: { select: { name: true } },
                variants: true,
            },
        });

        return NextResponse.json({
            message: 'Produk berhasil ditambahkan',
            product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { error: 'Gagal membuat produk' },
            { status: 500 }
        );
    }
}

