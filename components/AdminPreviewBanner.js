'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPreviewBanner() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is admin
        fetch('/api/auth/me', { credentials: 'include' })
            .then(async res => {
                // If not authenticated (401), user is not admin
                if (!res.ok) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                // Only show banner for ADMIN or SUPER_ADMIN
                if (data.user && (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN')) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }

                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to check admin status:', error);
                setIsAdmin(false);
                setLoading(false);
            });
    }, []);

    if (loading || !isAdmin) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 animate-pulse">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-semibold">Preview Mode</span>
                </div>

                <button
                    onClick={() => router.push('/admin')}
                    className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                    ← Kembali ke Dashboard
                </button>
            </div>

            <div className="mt-2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm text-center">
                🛒 Fitur belanja dinonaktifkan untuk Admin
            </div>
        </div>
    );
}
