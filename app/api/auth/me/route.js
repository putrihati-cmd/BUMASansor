import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/auth/me - Get current authenticated user
 * Returns user info if authenticated, 401 if not
 */
export async function GET(request) {
    try {
        const auth = await verifyAuth(request);

        if (!auth.success) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Return sanitized user data (no sensitive info)
        return NextResponse.json({
            user: {
                id: auth.users.id,
                email: auth.users.email,
                name: auth.users.name,
                role: auth.users.role,
                avatar_url: auth.users.avatar_url,
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user data' },
            { status: 500 }
        );
    }
}
