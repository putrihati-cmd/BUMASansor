'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Memverifikasi email...');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token verifikasi tidak ditemukan');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setStatus('error');
                    setMessage(data.error || 'Verifikasi gagal');
                    return;
                }

                setStatus('success');
                setMessage('Email berhasil diverifikasi!');
                setUserId(data.userId);

                // Redirect to complete profile after 2 seconds
                setTimeout(() => {
                    router.push(`/auth/complete-profile?userId=${data.userId}&token=${token}`);
                }, 2000);

            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Terjadi kesalahan');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-neutral-800 mb-2">Memverifikasi Email</h1>
                            <p className="text-neutral-500">Mohon tunggu sebentar...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-neutral-800 mb-2">Email Terverifikasi! ✅</h1>
                            <p className="text-neutral-500 mb-4">{message}</p>
                            <p className="text-sm text-neutral-400">Mengalihkan ke halaman lengkapi profil...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-neutral-800 mb-2">Verifikasi Gagal</h1>
                            <p className="text-neutral-500 mb-6">{message}</p>
                            <Link
                                href="/auth/register"
                                className="inline-block bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600"
                            >
                                Kembali ke Daftar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

