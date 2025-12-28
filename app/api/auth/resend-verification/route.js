import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import crypto from 'crypto';

import { sendVerificationEmail } from '@/lib/email';


/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 */
export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email diperlukan' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.users.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // Don't reveal if user exists or not for security
            return NextResponse.json({
                success: true,
                message: 'Jika email terdaftar, link verifikasi akan dikirim'
            });
        }

        // Check if already verified
        if (user.emailVerifiedAt) {
            return NextResponse.json(
                { error: 'Email sudah terverifikasi' },
                { status: 400 }
            );
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        // Update user with new token (expires in 24 hours)
        await prisma.users.update({
            where: { id: user.id },
            data: {
                verificationToken: hashedToken,
                verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        // Send verification email
        await sendVerificationEmail({ email: user.email, name: user.name }, verificationToken);

        console.log('✅ Verification email resent to:', user.email);

        return NextResponse.json({
            success: true,
            message: 'Link verifikasi telah dikirim ke email Anda'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { error: 'Gagal mengirim ulang email verifikasi' },
            { status: 500 }
        );
    }
}

