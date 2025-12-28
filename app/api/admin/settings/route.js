import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { verifyAuth } from '@/lib/auth';


/**
 * GET /api/admin/settings
 * Retrieve all system settings
 */
export async function GET(request) {
    const auth = await verifyAuth(request);
    if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const settings = await prisma.setting.findMany();

        // Transform array to object for easier frontend consumption
        // [{ key: 'siteName', value: 'Infiya' }] => { siteName: 'Infiya' }
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

/**
 * PUT /api/admin/settings
 * Update or Create settings key-values
 * Body: { settings: { key: value, key2: value2 } }
 */
export async function PUT(request) {
    const auth = await verifyAuth(request);
    if (!auth.success || !['ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { settings } = await request.json();

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
        }

        const updates = [];

        // Process each key-value pair using upsert
        for (const [key, value] of Object.entries(settings)) {
            // Ensure value is string
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

            updates.push(prisma.setting.upsert({
                where: { key },
                update: { value: stringValue },
                create: {
                    key,
                    value: stringValue,
                    isPublic: true // Default to public for now, adjust as needed
                }
            }));
        }

        // Execute all updates in transaction
        await prisma.$transaction(updates);

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

