import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import bcrypt from 'bcryptjs';

import crypto from 'crypto';

import { verifyAuth } from '@/lib/auth';


/**
 * DELETE /api/auth/delete-account
 * Soft delete user account (GDPR compliance)
 * Requires password confirmation
 */
export async function DELETE(request) {
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
        const { password, confirmation } = body;

        // Validation
        if (!password) {
            return NextResponse.json(
                { error: 'Password diperlukan untuk konfirmasi' },
                { status: 400 }
            );
        }

        if (confirmation !== 'DELETE') {
            return NextResponse.json(
                { error: 'Konfirmasi tidak valid. Ketik "DELETE" untuk melanjutkan' },
                { status: 400 }
            );
        }

        // Get user
        const user = await prisma.users.findUnique({
            where: { id: auth.user.id },
            include: {
                orders: {
                    where: {
                        status: { in: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED'] }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Password tidak sesuai' },
                { status: 400 }
            );
        }

        // Check if user has active orders
        if (user.orders.length > 0) {
            return NextResponse.json(
                {
                    error: 'Tidak dapat menghapus akun. Anda masih memiliki pesanan yang aktif.',
                    activeOrders: user.orders.length
                },
                { status: 400 }
            );
        }

        // Soft delete: anonymize user data instead of hard delete
        // This preserves order history for analytics
        const randomSuffix = Math.random().toString(36).substring(7);

        await prisma.users.update({
            where: { id: user.id },
            data: {
                email: `deleted_${user.id}_${randomSuffix}@deleted.local`,
                name: '[Deleted User]',
                phone: null,
                avatarUrl: null,
                status: 'SUSPENDED',
                passwordHash: crypto.randomBytes(32).toString('hex'), // Invalidate password
                // Clear sensitive tokens
                verificationToken: null,
                verificationTokenExpires: null,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        // Optionally: Delete personal data from other tables
        await prisma.address.deleteMany({
            where: { userId: user.id }
        });

        await prisma.cart.deleteMany({
            where: { userId: user.id }
        });

        await prisma.wishlist.deleteMany({
            where: { userId: user.id }
        });

        console.log('✅ Account deleted (soft) for user:', user.email);

        return NextResponse.json({
            success: true,
            message: 'Akun Anda berhasil dihapus. Terima kasih telah menggunakan layanan kami.'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        return NextResponse.json(
            { error: 'Gagal menghapus akun' },
            { status: 500 }
        );
    }
}

