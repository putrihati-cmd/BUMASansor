import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via WhatsApp
 * @param {string} phone - Phone number (format: 08xxx or +62xxx)
 * @param {string} userId - User ID (optional, for linking)
 * @param {string} type - OTP type: 'REGISTRATION', 'LOGIN', 'PASSWORD_RESET'
 * @returns {Promise<{success: boolean, message: string, expiresIn: number}>}
 */
export async function sendWhatsAppOTP(phone, userId = null, type = 'REGISTRATION') {
    try {
        // Check rate limiting: Max 3 OTP per 10 minutes per phone
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentOTPs = await prisma.otp_verifications.count({
            where: {
                phone,
                createdAt: { gte: tenMinutesAgo },
            },
        });

        if (recentOTPs >= 3) {
            throw new Error('Terlalu banyak permintaan. Coba lagi dalam 10 menit.');
        }

        // Delete old OTPs for this phone (invalidate previous codes)
        await prisma.otp_verifications.deleteMany({
            where: { phone },
        });

        // Generate 6-digit OTP
        const otp = generateOTP();

        // Hash OTP
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save to database
        const otpRecord = await prisma.otp_verifications.create({
            data: {
                userId,
                phone,
                otp: hashedOTP,
                type,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            },
        });

        // Format WhatsApp message
        const message = `
🔐 *Kode Verifikasi Infiatin Store*

Kode OTP Anda: *${otp}*

Berlaku selama 5 menit.
⚠️ Jangan bagikan kode ini kepada siapapun!

_Abaikan pesan ini jika Anda tidak meminta kode verifikasi._
        `.trim();

        // Send via WhatsApp (using existing n8n webhook)
        await sendWhatsAppNotification(phone, 'OTP_VERIFICATION', {
            otp,
            message,
        });

        console.log(`✅ OTP sent to ${phone} for ${type}`);

        return {
            success: true,
            message: 'Kode OTP telah dikirim ke WhatsApp Anda',
            expiresIn: 300, // 5 minutes in seconds
        };
    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
}

/**
 * Verify OTP code
 * @param {string} phone - Phone number
 * @param {string} otpCode - 6-digit OTP code from user
 * @returns {Promise<{success: boolean, userId?: string, message: string}>}
 */
export async function verifyWhatsAppOTP(phone, otpCode) {
    try {
        // Find OTP record
        const otpRecord = await prisma.otp_verifications.findFirst({
            where: {
                phone,
                verified: false,
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            return {
                success: false,
                message: 'Kode OTP tidak ditemukan. Silakan minta kode baru.',
            };
        }

        // Check expiry
        if (new Date() > otpRecord.expiresAt) {
            // Delete expired OTP
            await prisma.otp_verifications.delete({
                where: { id: otpRecord.id },
            });

            return {
                success: false,
                message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.',
            };
        }

        // Check attempts (max 3)
        if (otpRecord.attempts >= 3) {
            // Lock for 10 minutes
            return {
                success: false,
                message: 'Terlalu banyak percobaan gagal. Silakan minta kode baru.',
            };
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otpCode, otpRecord.otp);

        if (!isValid) {
            // Increment attempts
            await prisma.otp_verifications.update({
                where: { id: otpRecord.id },
                data: { attempts: otpRecord.attempts + 1 },
            });

            const attemptsLeft = 3 - (otpRecord.attempts + 1);
            return {
                success: false,
                message: `Kode OTP salah. Sisa percobaan: ${attemptsLeft}`,
            };
        }

        // OTP is valid!
        // Mark as verified
        await prisma.otp_verifications.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });

        // Update user status if userId exists
        if (otpRecord.userId) {
            await prisma.users.update({
                where: { id: otpRecord.userId },
                data: { status: 'ACTIVE' },
            });
        }

        // Clean up OTP record
        await prisma.otp_verifications.delete({
            where: { id: otpRecord.id },
        });

        console.log(`✅ OTP verified for ${phone}`);

        return {
            success: true,
            userId: otpRecord.userId,
            message: 'Nomor WhatsApp berhasil diverifikasi!',
        };
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
}

/**
 * Cleanup expired OTPs (call this periodically via cron)
 */
export async function cleanupExpiredOTPs() {
    try {
        const result = await prisma.otp_verifications.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });

        console.log(`🧹 Cleaned up ${result.count} expired OTPs`);
        return result.count;
    } catch (error) {
        console.error('Cleanup OTPs error:', error);
        return 0;
    }
}
