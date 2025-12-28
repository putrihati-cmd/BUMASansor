/**
 * API: Monthly Tax Report
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const auth = await verifyAuth(request);

        if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
        const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;

        // Get date range
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Aggregate invoices for the month (if invoices table exists)
        const report = await prisma.invoices?.aggregate({
            where: {
                issued_at: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'ACTIVE'
            },
            _sum: {
                subtotal: true,
                taxable_amount: true,
                tax_exempt_amount: true,
                total_tax: true,
                total_amount: true
            },
            _count: true
        }) || { _sum: {}, _count: 0 };

        return NextResponse.json({
            success: true,
            period: {
                year,
                month,
                startDate,
                endDate
            },
            summary: {
                totalInvoices: report._count || 0,
                totalSubtotal: report._sum?.subtotal || 0,
                totalDPP: report._sum?.taxable_amount || 0,
                totalTaxExempt: report._sum?.tax_exempt_amount || 0,
                totalPPN: report._sum?.total_tax || 0,
                totalAmount: report._sum?.total_amount || 0
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

