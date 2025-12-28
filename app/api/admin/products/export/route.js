/**
 * Product Export API
 * Migrated to ExcelJS
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createExcelFromJSON, generateExcelBuffer } from '@/lib/excel-helpers';

export const GET = requireAuth(async function GET(request, context) {
    try {
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const products = await prisma.product.findMany({
            include: { category: { select: { name: true } } }
        });

        const data = products.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            categoryId: p.categoryId,
            categoryName: p.category?.name || '',
            basePrice: Number(p.basePrice),
            salePrice: p.salePrice ? Number(p.salePrice) : null,
            stock: p.stock,
            weight: p.weight,
            images: JSON.stringify(p.images),
            status: p.status,
            isFeatured: p.isFeatured
        }));

        const workbook = await createExcelFromJSON(data, 'Products');
        const buffer = await generateExcelBuffer(workbook);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=products_${new Date().toISOString().split('T')[0]}.xlsx`
            }
        });
    } catch (error) {
        console.error('[Product Export] Error:', error);
        return NextResponse.json({ error: 'Failed to export products' }, { status: 500 });
    }
});

