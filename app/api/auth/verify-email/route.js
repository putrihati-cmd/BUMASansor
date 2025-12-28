import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/verify-email
 * Verify email token and update user status
 */
export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Token verifikasi tidak ditemukan' },
                { status: 400 }
            );
        }

        // Find user with this token
        const user = await prisma.users.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Token tidak valid atau sudah kadaluarsa' },
                { status: 400 }
            );
        }

        // Update user status - mark as verified (but still needs profile completion)
        await prisma.users.update({
            where: { id: user.id },
            data: {
                status: 'UNVERIFIED', // Email verified, but profile not complete
                emailVerifiedAt: new Date(),
                // Keep token for complete-profile verification
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Email berhasil diverifikasi',
            userId: user.id,
        });

    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat verifikasi' },
            { status: 500 }
        );
    }
}

