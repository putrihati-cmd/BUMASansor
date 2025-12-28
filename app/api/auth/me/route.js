import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/auth/me - Get current user
export async function GET(request) {
    try {
        const auth = await verifyAuth(request);

        if (!auth.success) {
            return NextResponse.json(
                { error: auth.error || 'Token tidak valid' },
                { status: 401 }
            );
        }

        // Get user from database with full details
        const user = await prisma.users.findUnique({
            where: { id: auth.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                role: true,
                status: true,
                createdAt: true,
                addresses: {
                    orderBy: { isDefault: 'desc' },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan' },
            { status: 500 }
        );
    }
}

// PUT /api/auth/me - Update current user profile
export async function PUT(request) {
    try {
        const auth = await verifyAuth(request);

        if (!auth.success) {
            return NextResponse.json(
                { error: auth.error || 'Token tidak valid' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, phone, avatarUrl } = body;

        const user = await prisma.users.update({
            where: { id: auth.user.id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(avatarUrl && { avatarUrl }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                role: true,
            },
        });

        return NextResponse.json({
            message: 'Profil berhasil diperbarui',
            user,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan' },
            { status: 500 }
        );
    }
}

