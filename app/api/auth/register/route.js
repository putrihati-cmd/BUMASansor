import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppOTP } from '@/lib/whatsapp-otp';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/register
 * Step 1: Register with phone OR email only
 * Returns: { needOTP: true, userId } or { needEmailVerification: true, userId }
 */
export async function POST(request) {
    try {
        const { identifier } = await request.json();

        if (!identifier || !identifier.trim()) {
            return NextResponse.json(
                { error: 'Nomor HP atau Email wajib diisi' },
                { status: 400 }
            );
        }

        const cleanIdentifier = identifier.trim();

        // Determine if email or phone
        const isEmail = /\S+@\S+\.\S+/.test(cleanIdentifier);
        const isPhone = /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(cleanIdentifier.replace(/\s/g, ''));

        if (!isEmail && !isPhone) {
            return NextResponse.json(
                { error: 'Format nomor HP atau email tidak valid' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.users.findFirst({
            where: isEmail
                ? { email: cleanIdentifier }
                : { phone: cleanIdentifier.replace(/^0/, '62') }
        });

        if (existingUser) {
            // If user exists but PENDING, allow re-registration (resend verification)
            if (existingUser.status === 'PENDING') {
                if (isPhone) {
                    await sendWhatsAppOTP(cleanIdentifier.replace(/^0/, '62'));
                    return NextResponse.json({
                        needOTP: true,
                        userId: existingUser.id,
                        message: 'Kode OTP baru telah dikirim'
                    });
                } else {
                    const token = crypto.randomBytes(32).toString('hex');
                    await prisma.users.update({
                        where: { id: existingUser.id },
                        data: {
                            verificationToken: token,
                            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
                        }
                    });
                    const userForEmail = { name: 'Pengguna', email: cleanIdentifier };
                    await sendVerificationEmail(userForEmail, token);
                    return NextResponse.json({
                        needEmailVerification: true,
                        userId: existingUser.id,
                        message: 'Link verifikasi baru telah dikirim'
                    });
                }
            }

            return NextResponse.json(
                { error: 'Akun dengan nomor HP atau email ini sudah terdaftar' },
                { status: 400 }
            );
        }

        // Create new user with PENDING status
        const userData = {
            name: '', // Will be filled in complete-profile
            passwordHash: '', // Will be filled in complete-profile
            status: 'PENDING',
            role: 'CUSTOMER',
        };

        if (isEmail) {
            userData.email = cleanIdentifier;
            userData.verificationToken = crypto.randomBytes(32).toString('hex');
            userData.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        } else {
            // Normalize phone to 62xxx format
            userData.phone = cleanIdentifier.replace(/^0/, '62');
        }

        const newUser = await prisma.users.create({ data: userData });

        // Send verification
        if (isPhone) {
            await sendWhatsAppOTP(userData.phone);
            return NextResponse.json({
                needOTP: true,
                userId: newUser.id,
                message: 'Kode OTP telah dikirim ke WhatsApp Anda'
            });
        } else {
            // Pass user object with email for sendVerificationEmail
            const userForEmail = { name: 'Pengguna', email: cleanIdentifier };
            await sendVerificationEmail(userForEmail, userData.verificationToken);
            return NextResponse.json({
                needEmailVerification: true,
                userId: newUser.id,
                message: 'Link verifikasi telah dikirim ke email Anda'
            });
        }

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mendaftar' },
            { status: 500 }
        );
    }
}

