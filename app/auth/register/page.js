'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');

    const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
    const isPhone = (value) => /^(\\+62|62|0)8[1-9][0-9]{6,10}$/.test(value.replace(/\s/g, ''));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!identifier.trim()) {
            setError('Nomor HP atau Email wajib diisi');
            return;
        }

        const isEmailInput = isEmail(identifier);
        const isPhoneInput = isPhone(identifier);

        if (!isEmailInput && !isPhoneInput) {
            setError('Format nomor HP atau email tidak valid');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Gagal mendaftar');
                return;
            }

            // Handle response based on type
            if (data.needOTP) {
                // Phone registration - redirect to OTP verification
                router.push(`/auth/verify-otp?phone=${encodeURIComponent(identifier)}&userId=${data.userId}`);
            } else if (data.needEmailVerification) {
                // Email registration - show message
                alert('✅ Link verifikasi telah dikirim ke email Anda. Silakan cek inbox.');
                router.push('/auth/login');
            }
        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan jaringan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">i</span>
                    </div>
                    <span className="font-display text-xl font-bold text-neutral-800">
                        Infiatin<span className="text-primary-500">Store</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-neutral-800 mb-1">
                            Daftar Sekarang
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Sudah punya akun?{' '}
                            <Link href="/auth/login" className="text-primary-500 font-semibold hover:underline">
                                Masuk
                            </Link>
                        </p>
                    </div>

                    {/* Google Button First */}
                    <GoogleLoginButton />

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-white text-neutral-400">atau</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Nomor HP atau Email"
                            className="text-center"
                        />

                        <Button type="submit" fullWidth loading={loading}>
                            Daftar
                        </Button>
                    </form>

                    <p className="text-[11px] text-neutral-400 text-center mt-5 leading-relaxed">
                        Dengan mendaftar, saya menyetujui{' '}
                        <Link href="/terms" className="text-primary-500 hover:underline">Syarat & Ketentuan</Link>
                        {' '}serta{' '}
                        <Link href="/privacy" className="text-primary-500 hover:underline">Kebijakan Privasi</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

