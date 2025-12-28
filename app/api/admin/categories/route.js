/**
 * GET /api/admin/categories
 * Get all categories
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


export async function GET() {
    try {
        const categories = await prisma.categories.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('[Admin Categories GET] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data kategori' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/categories
 * Create new category
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, slug, description, imageUrl, parentId } = body;

        // Validation
        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { success: false, error: 'Nama kategori harus minimal 2 karakter' },
                { status: 400 }
            );
        }

        if (!slug || slug.trim().length < 2) {
            return NextResponse.json(
                { success: false, error: 'Slug kategori harus minimal 2 karakter' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existing = await prisma.categories.findUnique({
            where: { slug: slug.trim() }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Slug sudah digunakan. Gunakan slug lain.' },
                { status: 400 }
            );
        }

        // Create category
        const category = await prisma.categories.create({
            data: {
                name: name.trim(),
                slug: slug.trim(),
                description: description?.trim() || null,
                imageUrl: imageUrl?.trim() || null,
                parentId: parentId || null,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Kategori berhasil ditambahkan',
            data: category
        });

    } catch (error) {
        console.error('[Admin Categories POST] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menambahkan kategori' },
            { status: 500 }
        );
    }
}

