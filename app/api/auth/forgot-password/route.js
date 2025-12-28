import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { sendPasswordResetEmail } from '@/lib/email';

import crypto from 'crypto';


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
            where: { email: email.toLowerCase() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            console.log('Password reset requested for non-existent email:', email);
            return NextResponse.json({
                success: true,
                message: 'Jika email terdaftar, link reset password telah dikirim.',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Save hashed token to database (expires in 1 hour)
        await prisma.users.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
        });

        // Send reset email
        await sendPasswordResetEmail(user, resetToken);

        console.log('✅ Password reset email sent to:', email);

        return NextResponse.json({
            success: true,
            message: 'Jika email terdaftar, link reset password telah dikirim.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Gagal mengirim email reset password' },
            { status: 500 }
        );
    }
}

