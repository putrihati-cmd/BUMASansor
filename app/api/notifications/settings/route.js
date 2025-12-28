/**
 * API: Notification Settings (User Preferences)
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

        const preferences = await notificationService.getUserPreferences(auth.user.id);

        return NextResponse.json({
            success: true,
            preferences
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();

        const preferences = await notificationService.updatePreferences(
            auth.user.id,
            updates
        );

        return NextResponse.json({
            success: true,
            preferences
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

