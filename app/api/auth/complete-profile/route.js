import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/complete-profile
 * Step 2: Complete registration with name and password
 */
export async function POST(request) {
    try {
        const { userId, token, name, password } = await request.json();

        // Validate inputs
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Nama wajib diisi' },
                { status: 400 }
            );
        }

        if (!password || password.length < 8) {
            return NextResponse.json(
                { error: 'Password minimal 8 karakter' },
                { status: 400 }
            );
        }

        // Find user
        let user;

        if (userId) {
            user = await prisma.users.findUnique({ where: { id: userId } });
        } else if (token) {
            // For email verification flow
            user = await prisma.users.findFirst({
                where: {
                    verificationToken: token,
                    verificationTokenExpires: { gt: new Date() }
                }
            });
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan atau link sudah expired' },
                { status: 404 }
            );
        }

        // Check if user is in correct state (PENDING or just verified)
        if (user.status !== 'PENDING' && user.status !== 'UNVERIFIED') {
            // User already active, might be duplicate submission
            if (user.status === 'ACTIVE') {
                return NextResponse.json(
                    { error: 'Akun sudah aktif. Silakan login.' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'Status akun tidak valid' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Update user
        const updatedUser = await prisma.users.update({
            where: { id: user.id },
            data: {
                name: name.trim(),
                passwordHash,
                status: 'ACTIVE',
                emailVerifiedAt: user.email ? new Date() : null,
                verificationToken: null,
                verificationTokenExpires: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatarUrl: true,
                role: true,
                status: true,
            }
        });

        // Generate JWT
        const jwtToken = await generateToken(updatedUser);

        // Set cookie
        const response = NextResponse.json({
            message: 'Registrasi berhasil',
            user: updatedUser,
            token: jwtToken,
        });

        response.cookies.set('auth-token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Complete profile error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat menyelesaikan registrasi' },
            { status: 500 }
        );
    }
}

