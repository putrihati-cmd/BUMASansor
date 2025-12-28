/**
 * API: Generate Invoice
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { invoiceGenerator } from '@/lib/invoiceGenerator';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const auth = await verifyAuth(request);

        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await request.json();

        const invoice = await invoiceGenerator.createInvoice(orderId);

        return NextResponse.json({
            success: true,
            invoice
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

