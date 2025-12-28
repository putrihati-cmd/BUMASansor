/**
 * API: Notifications CRUD
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const offset = parseInt(searchParams.get('offset')) || 0;

        const notifications = await notificationService.getNotifications(
            auth.user.id,
            limit,
            offset
        );

        const unreadCount = await notificationService.getUnreadCount(auth.user.id);

        return NextResponse.json({
            success: true,
            notifications,
            unreadCount
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        const notification = await notificationService.createNotification({
            userId: data.userId || auth.user.id,
            ...data
        });

        return NextResponse.json({
            success: true,
            notification
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

