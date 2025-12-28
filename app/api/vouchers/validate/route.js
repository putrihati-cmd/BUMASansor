import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


// POST /api/vouchers/validate - Validate voucher code
export async function POST(request) {
    try {
        const body = await request.json();
        const { code, subtotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Kode voucher wajib diisi' }, { status: 400 });
        }

        const voucher = await prisma.vouchers.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!voucher) {
            return NextResponse.json({
                valid: false,
                error: 'Kode voucher tidak ditemukan'
            }, { status: 404 });
        }

        // Check status
        if (voucher.status !== 'ACTIVE') {
            return NextResponse.json({
                valid: false,
                error: 'Voucher sudah tidak aktif'
            });
        }

        // Check date validity
        const now = new Date();
        if (now < voucher.validFrom || now > voucher.validUntil) {
            return NextResponse.json({
                valid: false,
                error: 'Voucher sudah kadaluarsa'
            });
        }

        // Check usage limit
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            return NextResponse.json({
                valid: false,
                error: 'Kuota voucher sudah habis'
            });
        }

        // Check minimum purchase
        if (subtotal && subtotal < Number(voucher.minPurchase)) {
            return NextResponse.json({
                valid: false,
                error: `Minimum belanja Rp${Number(voucher.minPurchase).toLocaleString('id-ID')}`
            });
        }

        // Calculate discount
        let discount = 0;
        if (subtotal) {
            if (voucher.type === 'PERCENTAGE') {
                discount = subtotal * (Number(voucher.value) / 100);
                if (voucher.maxDiscount) {
                    discount = Math.min(discount, Number(voucher.maxDiscount));
                }
            } else if (voucher.type === 'FIXED_AMOUNT') {
                discount = Number(voucher.value);
            } else if (voucher.type === 'FREE_SHIPPING') {
                discount = 0; // Handle separately in checkout
            }
        }

        return NextResponse.json({
            valid: true,
            voucher: {
                code: voucher.code,
                type: voucher.type,
                value: voucher.value,
                maxDiscount: voucher.maxDiscount,
                minPurchase: voucher.minPurchase,
            },
            discount: Math.round(discount),
            message: 'Voucher berhasil diterapkan!',
        });
    } catch (error) {
        console.error('Validate voucher error:', error);
        return NextResponse.json({ error: 'Gagal validasi voucher' }, { status: 500 });
    }
}

