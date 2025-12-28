/**
 * Product Bulk Upload API
 * Migrated to ExcelJS
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { readExcelBuffer } from '@/lib/excel-helpers';

export const POST = requireAuth(async function POST(request, context) {
    try {
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const data = await readExcelBuffer(buffer);

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 });
        }

        const results = { total: data.length, success: 0, failed: 0, errors: [] };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                await prisma.product.create({
                    data: {
                        name: row.name,
                        slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
                        description: row.description || '',
                        categoryId: row.categoryId,
                        basePrice: parseFloat(row.basePrice),
                        salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
                        stock: parseInt(row.stock || 0),
                        weight: parseInt(row.weight || 0),
                        images: row.images ? JSON.parse(row.images) : [],
                        status: row.status || 'ACTIVE'
                    }
                });
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ row: i + 1, error: error.message });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('[Bulk Upload] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});

