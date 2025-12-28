'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import useUserStore from '@/store/user';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone');
    const { setUser } = useUserStore();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    //Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    // Format timer
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle OTP input
    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (newOtp.every((digit) => digit) && index === 5) {
            handleVerify(newOtp.join(''));
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
            handleVerify(pastedData);
        }
    };

    // Verify OTP
    const handleVerify = async (otpCode) => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ phone, otp: otpCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Kode OTP salah');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            // Check if user needs to complete profile
            if (data.needCompleteProfile) {
                // Redirect to complete profile page
                const userId = searchParams.get('userId');
                router.push(`/auth/complete-profile?userId=${userId}`);
            } else if (data.user) {
                // User already has profile (shouldn't happen in new flow, but fallback)
                setUser(data.user, data.token);
                router.push('/');
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, type: 'REGISTRATION' }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Gagal mengirim ulang kode');
                return;
            }

            // Reset timer and OTP
            setTimer(300);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            alert('Kode OTP baru telah dikirim ke WhatsApp Anda');
        } catch (err) {
            console.error('Resend OTP error:', err);
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Redirect if no phone
    useEffect(() => {
        if (!phone) {
            router.push('/auth/register');
        }
    }, [phone, router]);

    if (!phone) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back button */}
                <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-800 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm">Kembali</span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-primary-500" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-xl md:text-2xl font-display font-bold text-neutral-800 mb-2">
                            Verifikasi Nomor WhatsApp
                        </h1>
                        <p className="text-sm md:text-base text-neutral-500">
                            Kode OTP telah dikirim ke
                        </p>
                        <p className="font-semibold text-neutral-700 mt-1">{phone}</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* OTP Inputs */}
                    <div className="mb-6">
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 mb-6 text-sm text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>
                            {timer > 0 ? (
                                <>Kode berlaku: <strong className="text-primary-500">{formatTime(timer)}</strong></>
                            ) : (
                                <span className="text-red-500 font-medium">Kode sudah kadaluarsa</span>
                            )}
                        </span>
                    </div>

                    {/* Resend */}
                    <div className="text-center mb-6">
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                disabled={loading}
                                className="text-primary-500 hover:text-primary-600 font-medium disabled:opacity-50"
                            >
                                Kirim Ulang Kode
                            </button>
                        ) : (
                            <p className="text-sm text-neutral-500">
                                Tidak menerima kode?{' '}
                                <span className="text-neutral-400">Tunggu {formatTime(timer)}</span>
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={() => handleVerify(otp.join(''))}
                        fullWidth
                        size="lg"
                        loading={loading}
                        disabled={otp.some((digit) => !digit) || loading}
                    >
                        Verifikasi
                    </Button>

                    {/* Help */}
                    <div className="mt-6 pt-6 border-t border-neutral-100">
                        <p className="text-xs text-center text-neutral-500">
                            💡 <strong>Tips:</strong> Periksa pesan WhatsApp dari Infiatin Store.
                            Pastikan nomor yang didaftarkan benar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}

