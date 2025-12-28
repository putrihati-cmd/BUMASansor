/**
 * API: Mark All Notifications as Read
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await notificationService.markAllAsRead(auth.user.id);

        return NextResponse.json({
            success: true
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

