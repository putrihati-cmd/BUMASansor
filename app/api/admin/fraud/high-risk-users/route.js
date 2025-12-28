/**
 * API: High Risk Users
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

        const users = await prisma.user_risk_profiles?.findMany({
            where: {
                risk_score: { gte: 70 }
            },
            orderBy: { risk_score: 'desc' },
            take: 50
        }) || [];

        return NextResponse.json({
            success: true,
            data: users
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

