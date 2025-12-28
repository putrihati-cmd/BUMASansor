/**
 * INTERNAL TEST EMAIL ENDPOINT
 * 
 * ⚠️ ENDPOINT INI HANYA UNTUK TESTING SMTP
 * 
 * TIDAK DIGUNAKAN UNTUK:
 * - Auth flow
 * - Email verification
 * - Production features
 * 
 * METHOD: POST
 * PATH: /api/internal/test-email
 * BODY: { "to": "email@example.com" }
 */

import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';
export async function POST(request) {
    try {
        // Dynamic import untuk CommonJS module
        const { sendTestEmail, verifySmtpConnection } = await import('@/lib/mailer');


        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('❌ Error parsing JSON:', parseError);
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        const { to } = body;

        // Validation
        if (!to) {
            return NextResponse.json(
                { error: 'Email tujuan (to) wajib diisi' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            );
        }

        // Check SMTP config
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return NextResponse.json(
                {
                    error: 'SMTP belum dikonfigurasi',
                    hint: 'Set SMTP_USER dan SMTP_PASS di .env'
                },
                { status: 500 }
            );
        }

        console.log(`📧 Mengirim test email ke: ${to}`);

        // Verify connection first
        console.log('🔍 Verifying SMTP connection...');
        const connectionOk = await verifySmtpConnection();
        if (!connectionOk) {
            return NextResponse.json(
                {
                    error: 'Gagal koneksi ke SMTP server',
                    hint: 'Periksa SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
                },
                { status: 500 }
            );
        }

        console.log('✅ SMTP connection OK, sending email...');

        // Send test email
        const result = await sendTestEmail(to);

        return NextResponse.json({
            success: true,
            message: 'Email berhasil dikirim',
            messageId: result.messageId,
            to: to,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('❌ Error di test-email endpoint:', error);
        console.error('Stack:', error.stack);

        return NextResponse.json(
            {
                error: 'Gagal mengirim email',
                detail: error.message,
                type: error.code || 'UNKNOWN_ERROR'
            },
            { status: 500 }
        );
    }
}

// GET endpoint untuk check status SMTP
export async function GET() {
    try {
        // Dynamic import untuk CommonJS module
        const { verifySmtpConnection } = await import('@/lib/mailer');


        const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

        if (!smtpConfigured) {
            return NextResponse.json({
                configured: false,
                message: 'SMTP belum dikonfigurasi',
                hint: 'Set environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
            });
        }

        // Test connection
        const connectionOk = await verifySmtpConnection();

        return NextResponse.json({
            configured: true,
            connectionOk,
            config: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_SECURE === 'true',
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}***` : 'not set',
            },
            message: connectionOk ? 'SMTP ready' : 'SMTP connection failed'
        });

    } catch (error) {
        console.error('❌ Error checking SMTP status:', error);
        return NextResponse.json(
            {
                error: 'Gagal check SMTP status',
                detail: error.message
            },
            { status: 500 }
        );
    }
}

