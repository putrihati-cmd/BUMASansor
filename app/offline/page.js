'use client';

import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui';

export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-12 h-12 text-neutral-600" />
                </div>

                <h1 className="text-3xl font-bold text-neutral-800 mb-3">
                    Anda Sedang Offline
                </h1>

                <p className="text-neutral-600 mb-6">
                    Sepertinya koneksi internet Anda terputus. Periksa koneksi Anda dan coba lagi.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto"
                    >
                        Coba Lagi
                    </Button>

                    <Link href="/">
                        <Button variant="secondary" className="w-full sm:w-auto">
                            Kembali ke Beranda
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tips:</strong> Beberapa halaman dapat diakses secara offline jika sudah pernah dikunjungi sebelumnya.
                    </p>
                </div>
            </div>
        </main>
    );
}

