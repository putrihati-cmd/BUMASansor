import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


// POST /api/newsletter/subscribe - Subscribe to newsletter
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, name } = body;

        // Validation
        if (!email) {
            return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
        }

        // Check if already subscribed
        const existingSubscriber = await prisma.newsletter_subscribers.findUnique({
            where: { email },
        });

        if (existingSubscriber) {
            if (existingSubscriber.status === 'ACTIVE') {
                return NextResponse.json({
                    error: 'Email sudah terdaftar di newsletter kami'
                }, { status: 400 });
            } else {
                // Reactivate if previously unsubscribed
                await prisma.newsletter_subscribers.update({
                    where: { email },
                    data: {
                        status: 'ACTIVE',
                        name: name || existingSubscriber.name,
                    },
                });
                return NextResponse.json({
                    message: 'Selamat datang kembali! Anda telah berlangganan newsletter.',
                });
            }
        }

        // Create new subscriber
        await prisma.newsletter_subscribers.create({
            data: {
                email,
                name: name || null,
                status: 'ACTIVE',
            },
        });

        // TODO: Send welcome email via external service (e.g., SendGrid, Mailchimp)
        // await sendWelcomeEmail(email, name);

        return NextResponse.json({
            message: 'Terima kasih! Anda telah berlangganan newsletter kami.',
        }, { status: 201 });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json({ error: 'Gagal berlangganan newsletter' }, { status: 500 });
    }
}

// DELETE /api/newsletter/unsubscribe - Unsubscribe from newsletter
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const subscriber = await prisma.newsletter_subscribers.findUnique({
            where: { email },
        });

        if (!subscriber) {
            return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 404 });
        }

        await prisma.newsletter_subscribers.update({
            where: { email },
            data: { status: 'UNSUBSCRIBED' },
        });

        return NextResponse.json({
            message: 'Anda telah berhenti berlangganan newsletter.',
        });
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        return NextResponse.json({ error: 'Gagal berhenti berlangganan' }, { status: 500 });
    }
}

