import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


// POST /api/contact - Submit contact form
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json({
                error: 'Nama, email, dan pesan wajib diisi'
            }, { status: 400 });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
        }

        // Save to database
        const contact = await prisma.contactMessage.create({
            data: {
                name,
                email,
                phone: phone || null,
                subject: subject || 'General Inquiry',
                message,
                status: 'NEW',
            },
        });

        // TODO: Send notification to admin via email
        // await sendAdminNotification(contact);

        // TODO: Send auto-reply to customer
        // await sendAutoReply(email, name);

        return NextResponse.json({
            message: 'Pesan Anda telah dikirim. Kami akan segera menghubungi Anda.',
            contactId: contact.id,
        }, { status: 201 });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 });
    }
}

