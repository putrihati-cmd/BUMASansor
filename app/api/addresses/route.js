import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/addresses - Get user addresses
export async function GET(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.user;

        const addresses = await prisma.addresses.findMany({
            where: { userId: user.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json({ success: true, addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data alamat' }, { status: 500 });
    }
}

// POST /api/addresses - Create new address
export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.user;

        const body = await request.json();
        const { label, recipientName, phone, fullAddress, province, city, district, postalCode, isDefault } = body;

        // Validation
        if (!recipientName || !phone || !fullAddress || !city || !postalCode) {
            return NextResponse.json({ error: 'Data alamat tidak lengkap' }, { status: 400 });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.addresses.updateMany({
                where: { userId: user.id },
                data: { isDefault: false },
            });
        }

        const address = await prisma.addresses.create({
            data: {
                userId: user.id,
                label: label || 'HOME',
                recipientName,
                phone,
                fullAddress,
                province: province || '',
                city,
                district: district || '',
                postalCode,
                isDefault: isDefault || false,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Alamat berhasil ditambahkan',
            address,
        }, { status: 201 });
    } catch (error) {
        console.error('Create address error:', error);
        return NextResponse.json({ error: 'Gagal menambahkan alamat' }, { status: 500 });
    }
}

// PUT /api/addresses - Update address (uses query param ?id=xxx)
export async function PUT(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.user;

        const { searchParams } = new URL(request.url);
        const addressId = searchParams.get('id');

        if (!addressId) {
            return NextResponse.json({ error: 'Address ID diperlukan' }, { status: 400 });
        }

        // Check ownership
        const existing = await prisma.addresses.findFirst({
            where: { id: addressId, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Alamat tidak ditemukan' }, { status: 404 });
        }

        const body = await request.json();
        const { label, recipientName, phone, fullAddress, province, city, district, postalCode, isDefault } = body;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.addresses.updateMany({
                where: { userId: user.id, id: { not: addressId } },
                data: { isDefault: false },
            });
        }

        const address = await prisma.addresses.update({
            where: { id: addressId },
            data: {
                label: label || existing.label,
                recipientName: recipientName || existing.recipientName,
                phone: phone || existing.phone,
                fullAddress: fullAddress || existing.fullAddress,
                province: province !== undefined ? province : existing.province,
                city: city || existing.city,
                district: district !== undefined ? district : existing.district,
                postalCode: postalCode || existing.postalCode,
                isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Alamat berhasil diperbarui',
            address,
        });
    } catch (error) {
        console.error('Update address error:', error);
        return NextResponse.json({ error: 'Gagal memperbarui alamat' }, { status: 500 });
    }
}

// DELETE /api/addresses - Delete address (uses query param ?id=xxx)
export async function DELETE(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.user;

        const { searchParams } = new URL(request.url);
        const addressId = searchParams.get('id');

        if (!addressId) {
            return NextResponse.json({ error: 'Address ID diperlukan' }, { status: 400 });
        }

        // Check ownership
        const existing = await prisma.addresses.findFirst({
            where: { id: addressId, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Alamat tidak ditemukan' }, { status: 404 });
        }

        await prisma.addresses.delete({
            where: { id: addressId }
        });

        return NextResponse.json({
            success: true,
            message: 'Alamat berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete address error:', error);
        return NextResponse.json({ error: 'Gagal menghapus alamat' }, { status: 500 });
    }
}

