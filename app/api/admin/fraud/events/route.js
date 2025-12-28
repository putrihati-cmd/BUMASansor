/**
 * API: Fraud Events
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
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit')) || 50;

        const events = await prisma.fraud_events?.findMany({
            where: status ? { status } : {},
            orderBy: { created_at: 'desc' },
            take: limit
        }) || [];

        return NextResponse.json({
            success: true,
            data: events
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

