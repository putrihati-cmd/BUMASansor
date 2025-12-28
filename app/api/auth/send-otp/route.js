import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { sendWhatsAppOTP } from '@/lib/whatsapp-otp';


/**
 * POST /api/auth/send-otp
 * Send OTP to WhatsApp number
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { phone, type = 'REGISTRATION' } = body;

        // Validation
        if (!phone) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp wajib diisi' },
                { status: 400 }
            );
        }

        // Validate phone format (Indonesian numbers)
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return NextResponse.json(
                { error: 'Format nomor WhatsApp tidak valid' },
                { status: 400 }
            );
        }

        // Send OTP
        const result = await sendWhatsAppOTP(phone, null, type);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Send OTP API error:', error);

        // Handle specific error messages
        if (error.message.includes('Terlalu banyak')) {
            return NextResponse.json(
                { error: error.message },
                { status: 429 } // Too Many Requests
            );
        }

        return NextResponse.json(
            { error: 'Gagal mengirim kode OTP. Silakan coba lagi.' },
            { status: 500 }
        );
    }
}

