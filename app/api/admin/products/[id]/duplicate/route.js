import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

/**
 * POST /api/admin/products/[id]/duplicate
 * Duplicate a product
 */
export async function POST(request, { params }) {
    try {
        // Verify admin auth
        const auth = await verifyAuth(request);
        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Get original product
        const original = await prisma.products.findUnique({
            where: { id },
            include: { variants: true },
        });

        if (!original) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Create duplicate
        const duplicate = await prisma.products.create({
            data: {
                name: `${original.name} (Copy)`,
                slug: `${original.slug}-copy-${Date.now()}`,
                description: original.description,
                basePrice: original.basePrice,
                salePrice: original.salePrice,
                stock: original.stock,
                category: original.category,
                images: original.images,
                weight: original.weight,
                status: 'INACTIVE', // Set to inactive by default
                isFeatured: false,
                isNew: false,
                tags: original.tags,
                variants: {
                    create: original.variants.map(variant => ({
                        name: variant.name,
                        options: variant.options,
                        priceAdjustment: variant.priceAdjustment,
                        stock: variant.stock,
                    })),
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Product duplicated successfully',
            product: duplicate,
        });

    } catch (error) {
        console.error('Duplicate product error:', error);
        return NextResponse.json(
            { error: 'Failed to duplicate product' },
            { status: 500 }
        );
    }
}
