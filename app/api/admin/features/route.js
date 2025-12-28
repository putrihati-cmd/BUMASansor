import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getFeatureFlags, updateFeatureFlags, DEFAULT_FEATURES } from '@/lib/featureFlags';
import { requireAdmin } from '@/lib/auth';


/**
 * GET /api/admin/features
 * Get all feature flags with their current status
 */
export async function GET(request) {
    try {
        const flags = await getFeatureFlags();

        // Group by category
        const grouped = {};
        for (const [key, value] of Object.entries(flags)) {
            const category = value.category || 'other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push({
                key,
                ...value
            });
        }

        return NextResponse.json({
            success: true,
            features: flags,
            grouped,
            categories: Object.keys(grouped)
        });
    } catch (error) {
        console.error('Get features error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get features' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/features
 * Update feature flags (admin only)
 */
export const PUT = requireAdmin(async function PUT(request, context) {
    try {
        const { features } = await request.json();

        if (!features || typeof features !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Invalid features data' },
                { status: 400 }
            );
        }

        const result = await updateFeatureFlags(features);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Feature flags updated successfully'
        });
    } catch (error) {
        console.error('Update features error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update features' },
            { status: 500 }
        );
    }
});

