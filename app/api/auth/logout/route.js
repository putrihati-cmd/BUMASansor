import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Logout berhasil'
        });

        // Clear the auth-token cookie
        response.cookies.delete('auth-token');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Logout gagal' },
            { status: 500 }
        );
    }
}

