import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';

import { generateToken } from '@/lib/auth';

import { logAdminLogin } from '@/lib/activityLogger';


export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email/WhatsApp dan password wajib diisi' },
                { status: 400 }
            );
        }

        // Find user by email OR phone
        // Check if input looks like phone number (starts with 0 or +62 or contains only digits)
        const isPhone = /^(\+62|62|0)/.test(email) || /^\d+$/.test(email);

        let user;
        if (isPhone) {
            user = await prisma.users.findFirst({
                where: { phone: email },
            });
        } else {
            user = await prisma.users.findUnique({
                where: { email },
            });
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Email/WhatsApp atau password salah' },
                { status: 401 }
            );
        }

        // Check if user is suspended
        if (user.status === 'SUSPENDED') {
            return NextResponse.json(
                { error: 'Akun Anda telah dinonaktifkan. Hubungi customer service.' },
                { status: 403 }
            );
        }

        // Check if user is unverified (email/phone not verified)
        if (user.status === 'UNVERIFIED') {
            return NextResponse.json(
                {
                    error: 'Akun belum diverifikasi. Silakan cek email atau WhatsApp Anda untuk kode verifikasi.',
                    needVerification: true,
                    email: user.email,
                    phone: user.phone
                },
                { status: 403 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = await generateToken(user);

        // Return user data (without password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatar_url,
        };

        // Create response with cookie
        const response = NextResponse.json({
            message: 'Login berhasil! Selamat datang kembali 👋',
            user: userData,
            token,
        });

        // Set auth-token cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Log admin login for audit trail
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            const ipAddress = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';
            const userAgent = request.headers.get('user-agent') || 'unknown';

            logAdminLogin(user.id, ipAddress, userAgent, true).catch(err => {
                console.error('[ActivityLog] Failed to log admin login:', err);
            });
        }

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan. Silakan coba lagi.' },
            { status: 500 }
        );
    }
}

