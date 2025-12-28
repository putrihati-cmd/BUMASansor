import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import bcrypt from 'bcryptjs';

import { verifyAuth } from '@/lib/auth';


/**
 * POST /api/auth/change-password
 * Change user password from account settings (requires old password)
 */
export async function POST(request) {
    try {
        // Verify authentication
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { oldPassword, newPassword } = body;

        // Validation
        if (!oldPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Password lama dan password baru wajib diisi' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password baru minimal 8 karakter' },
                { status: 400 }
            );
        }

        // Validate new password complexity
        if (!/[A-Z]/.test(newPassword)) {
            return NextResponse.json(
                { error: 'Password harus mengandung huruf besar' },
                { status: 400 }
            );
        }
        if (!/[a-z]/.test(newPassword)) {
            return NextResponse.json(
                { error: 'Password harus mengandung huruf kecil' },
                { status: 400 }
            );
        }
        if (!/[0-9]/.test(newPassword)) {
            return NextResponse.json(
                { error: 'Password harus mengandung angka' },
                { status: 400 }
            );
        }

        // Get current user with password
        const user = await prisma.users.findUnique({
            where: { id: auth.user.id },
            select: { id: true, email: true, passwordHash: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify old password
        const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Password lama tidak sesuai' },
                { status: 400 }
            );
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.users.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash }
        });

        console.log('✅ Password changed for user:', user.email);

        return NextResponse.json({
            success: true,
            message: 'Password berhasil diubah'
        });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Gagal mengubah password' },
            { status: 500 }
        );
    }
}

