'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
                    <h2 className="text-3xl font-display font-bold text-neutral-800 mb-4">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="text-neutral-600 mb-8">
                        Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin URL salah atau halaman telah dipindahkan.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <Button>
                            <Home className="w-4 h-4" />
                            Kembali ke Home
                        </Button>
                    </Link>
                    <Button variant="secondary" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Halaman Sebelumnya
                    </Button>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-200">
                    <p className="text-sm text-neutral-500 mb-3">Halaman populer:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link href="/products" className="text-sm text-primary-500 hover:underline">Produk</Link>
                        <span className="text-neutral-300">•</span>
                        <Link href="/cart" className="text-sm text-primary-500 hover:underline">Keranjang</Link>
                        <span className="text-neutral-300">•</span>
                        <Link href="/account" className="text-sm text-primary-500 hover:underline">Akun</Link>
                        <span className="text-neutral-300">•</span>
                        <Link href="/help" className="text-sm text-primary-500 hover:underline">Bantuan</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


