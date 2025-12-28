/**
 * GET /api/admin/categories/[id]
 * PATCH /api/admin/categories/[id]
 * DELETE /api/admin/categories/[id]
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET single category
 */
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const category = await prisma.categories.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Kategori tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category
        });

    } catch (error) {
        console.error('[Admin Category GET] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data kategori' },
            { status: 500 }
        );
    }
}

/**
 * PATCH update category
 */
export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, slug, description, imageUrl, parentId } = body;

        // Check if category exists
        const existing = await prisma.categories.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Kategori tidak ditemukan' },
                { status: 404 }
            );
        }

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

        // Check if slug is already used by another category
        if (slug !== existing.slug) {
            const duplicateSlug = await prisma.categories.findUnique({
                where: { slug: slug.trim() }
            });

            if (duplicateSlug) {
                return NextResponse.json(
                    { success: false, error: 'Slug sudah digunakan. Gunakan slug lain.' },
                    { status: 400 }
                );
            }
        }

        // Update category
        const category = await prisma.categories.update({
            where: { id },
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
            message: 'Kategori berhasil diperbarui',
            data: category
        });

    } catch (error) {
        console.error('[Admin Category PATCH] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal memperbarui kategori' },
            { status: 500 }
        );
    }
}

/**
 * DELETE category
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Check if category exists
        const category = await prisma.categories.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        });

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Kategori tidak ditemukan' },
                { status: 404 }
            );
        }

        // Prevent deletion if category has products
        if (category._count.products > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Tidak bisa menghapus kategori yang masih memiliki ${category._count.products} produk. Pindahkan produk terlebih dahulu.`
                },
                { status: 400 }
            );
        }

        // Prevent deletion if category has children
        if (category._count.children > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Tidak bisa menghapus kategori yang masih memiliki ${category._count.children} sub-kategori. Hapus sub-kategori terlebih dahulu.`
                },
                { status: 400 }
            );
        }

        // Delete category
        await prisma.categories.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Kategori berhasil dihapus'
        });

    } catch (error) {
        console.error('[Admin Category DELETE] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menghapus kategori' },
            { status: 500 }
        );
    }
}
