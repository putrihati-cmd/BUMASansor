/**
 * Product Import Template API
 * Migrated to ExcelJS
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAuth } from '@/lib/auth';
import { createTemplate, generateExcelBuffer } from '@/lib/excel-helpers';

export const GET = requireAuth(async function GET(request, context) {
    try {
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const headers = [
            'id', 'name', 'slug', 'description', 'categoryId',
            'basePrice', 'salePrice', 'stock', 'weight',
            'images', 'status', 'isFeatured'
        ];

        const workbook = await createTemplate(headers, 'Product Import Template');
        const buffer = await generateExcelBuffer(workbook);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=product_import_template.xlsx'
            }
        });
    } catch (error) {
        console.error('[Template] Error:', error);
        return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
    }
});

