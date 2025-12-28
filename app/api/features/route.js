import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getClientFeatureFlags } from '@/lib/featureFlags';

/**
 * GET /api/features
 * Get feature flags for client-side (public, no sensitive data)
 */
export async function GET() {
    try {
        const flags = await getClientFeatureFlags();

        return NextResponse.json({
            success: true,
            features: flags
        });
    } catch (error) {
        console.error('Get client features error:', error);
        return NextResponse.json({
            success: true,
            features: {} // Return empty if error, features will use defaults
        });
    }
}

