import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import bcrypt from 'bcryptjs';

import crypto from 'crypto';


export async function POST(request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token dan password baru diperlukan' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password minimal 8 karakter' },
                { status: 400 }
            );
        }

        // Hash the token to match stored version
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching reset token
        const user = await prisma.users.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    gt: new Date(), // Token not expired
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Token tidak valid atau sudah kadaluarsa' },
                { status: 400 }
            );
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update user password and clear reset token
        await prisma.users.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        console.log('✅ Password reset successful for user:', user.email);

        return NextResponse.json({
            success: true,
            message: 'Password berhasil diubah! Silakan login dengan password baru.',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Gagal mereset password' },
            { status: 500 }
        );
    }
}

