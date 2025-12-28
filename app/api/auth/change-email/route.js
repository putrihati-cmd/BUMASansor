import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import crypto from 'crypto';

import { verifyAuth } from '@/lib/auth';

import { sendVerificationEmail } from '@/lib/email';


/**
 * POST /api/auth/change-email
 * Request email change (will send verification to new email)
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
        const { newEmail, password } = body;

        // Validation
        if (!newEmail || !password) {
            return NextResponse.json(
                { error: 'Email baru dan password wajib diisi' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            );
        }

        // Get user with password
        const user = await prisma.users.findUnique({
            where: { id: auth.user.id },
            select: { id: true, email: true, passwordHash: true, name: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Check if new email is same as current
        if (newEmail.toLowerCase() === user.email.toLowerCase()) {
            return NextResponse.json(
                { error: 'Email baru sama dengan email saat ini' },
                { status: 400 }
            );
        }

        // Verify password
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Password tidak sesuai' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.users.findUnique({
            where: { email: newEmail.toLowerCase() }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email sudah digunakan' },
                { status: 400 }
            );
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        // Store pending email change in a separate table or in user metadata
        // For now, we'll use a JSON field approach
        await prisma.users.update({
            where: { id: user.id },
            data: {
                verificationToken: hashedToken,
                verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                // Store pending email in a custom field - you may need to add this to schema
                // pendingEmail: newEmail.toLowerCase()
            }
        });

        // Send verification email to NEW email
        await sendVerificationEmail(
            { email: newEmail, name: user.name },
            verificationToken
        );

        console.log('✅ Email change verification sent to:', newEmail);

        return NextResponse.json({
            success: true,
            message: `Link verifikasi telah dikirim ke ${newEmail}. Silakan cek email Anda.`
        });
    } catch (error) {
        console.error('Change email error:', error);
        return NextResponse.json(
            { error: 'Gagal memproses permintaan ganti email' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/auth/change-email/verify
 * Verify and apply email change
 */
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const newEmail = searchParams.get('email');

        if (!token || !newEmail) {
            return NextResponse.json(
                { error: 'Token dan email diperlukan' },
                { status: 400 }
            );
        }

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching token
        const user = await prisma.users.findFirst({
            where: {
                verificationToken: hashedToken,
                verificationTokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Token tidak valid atau sudah kadaluarsa' },
                { status: 400 }
            );
        }

        // Check if new email is still available
        const existingUser = await prisma.users.findUnique({
            where: { email: newEmail.toLowerCase() }
        });

        if (existingUser && existingUser.id !== user.id) {
            return NextResponse.json(
                { error: 'Email sudah digunakan oleh user lain' },
                { status: 400 }
            );
        }

        // Update email
        await prisma.users.update({
            where: { id: user.id },
            data: {
                email: newEmail.toLowerCase(),
                verificationToken: null,
                verificationTokenExpires: null,
                emailVerifiedAt: new Date()
            }
        });

        console.log('✅ Email changed successfully for user:', user.id);

        return NextResponse.json({
            success: true,
            message: 'Email berhasil diubah!'
        });
    } catch (error) {
        console.error('Verify email change error:', error);
        return NextResponse.json(
            { error: 'Gagal memverifikasi perubahan email' },
            { status: 500 }
        );
    }
}

