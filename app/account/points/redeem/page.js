'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowLeft, Gift, Coins, Check } from 'lucide-react';
import useUserStore from '@/store/user';
import { formatRupiah } from '@/lib/utils';
import FeatureDisabledPage from '@/components/FeatureDisabled';

// Daftar voucher yang bisa ditukar dengan koin
const REDEEM_OPTIONS = [
    { id: 1, name: 'Diskon Rp 10.000', coins: 100, value: 10000, type: 'FIXED' },
    { id: 2, name: 'Diskon Rp 25.000', coins: 200, value: 25000, type: 'FIXED' },
    { id: 3, name: 'Diskon Rp 50.000', coins: 400, value: 50000, type: 'FIXED' },
    { id: 4, name: 'Diskon 10%', coins: 150, value: 10, type: 'PERCENTAGE', maxDiscount: 50000 },
    { id: 5, name: 'Gratis Ongkir', coins: 100, value: 0, type: 'FREE_SHIPPING', maxDiscount: 30000 },
];

export default function RedeemPointsPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useUserStore();
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);
    const [success, setSuccess] = useState(null);
    const [featureEnabled, setFeatureEnabled] = useState(null);

    useEffect(() => {
        // Check feature flag first
        fetch('/api/features')
            .then(res => res.json())
            .then(data => {
                setFeatureEnabled(data.features?.POINTS_REDEEM ?? false);
            })
            .catch(() => setFeatureEnabled(false));

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        fetchUserPoints();
    }, [isAuthenticated]);

    const fetchUserPoints = async () => {
        try {
            const response = await fetch('/api/points');
            const data = await response.json();
            if (data.success) {
                setUserPoints(data.balance || 0);
            }
        } catch (error) {
            console.error('Failed to fetch points:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (option) => {
        if (userPoints < option.coins) {
            alert('Koin tidak cukup!');
            return;
        }

        setRedeeming(option.id);
        try {
            const response = await fetch('/api/points/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId: option.id }),
            });

            const data = await response.json();
            if (data.success) {
                setSuccess(option.id);
                setUserPoints(prev => prev - option.coins);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                alert(data.error || 'Gagal menukar koin');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        } finally {
            setRedeeming(null);
        }
    };

    // Show feature disabled page if not enabled
    if (featureEnabled === false) {
        return (
            <FeatureDisabledPage
                featureName="Tukar Koin"
                description="Fitur penukaran koin dengan voucher diskon sedang dalam pengembangan."
                backUrl="/account/points"
                backLabel="Kembali ke Koin Saya"
            />
        );
    }

    if (loading || featureEnabled === null) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-neutral-50 pt-4 pb-20">
                    <div className="container-app">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-neutral-200 rounded w-1/3" />
                            <div className="h-32 bg-neutral-200 rounded" />
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-neutral-50 pt-4 pb-20">
                <div className="container-app">
                    {/* Back Button */}
                    <Link href="/account/points" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Gift className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Tukar Koin</h1>
                        </div>
                        <p className="opacity-80">Tukarkan koin Anda dengan voucher diskon</p>
                        <div className="mt-4 flex items-center gap-2">
                            <Coins className="w-5 h-5" />
                            <span className="text-xl font-bold">{userPoints.toLocaleString()} Koin</span>
                        </div>
                    </div>

                    {/* Redeem Options */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-neutral-800">Pilih Voucher</h2>

                        {REDEEM_OPTIONS.map((option) => {
                            const canRedeem = userPoints >= option.coins;
                            const isRedeeming = redeeming === option.id;
                            const isSuccess = success === option.id;

                            return (
                                <div
                                    key={option.id}
                                    className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${canRedeem ? 'border-transparent hover:border-primary-200' : 'border-transparent opacity-60'
                                        } ${isSuccess ? 'border-green-500 bg-green-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-neutral-800">{option.name}</h3>
                                            <div className="flex items-center gap-1 text-sm text-primary-500 mt-1">
                                                <Coins className="w-4 h-4" />
                                                <span>{option.coins} Koin</span>
                                            </div>
                                            {option.maxDiscount && (
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    Maks. {formatRupiah(option.maxDiscount)}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleRedeem(option)}
                                            disabled={!canRedeem || isRedeeming || isSuccess}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSuccess
                                                ? 'bg-green-500 text-white'
                                                : canRedeem
                                                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                                                    : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isSuccess ? (
                                                <span className="flex items-center gap-1">
                                                    <Check className="w-4 h-4" /> Berhasil
                                                </span>
                                            ) : isRedeeming ? (
                                                'Menukar...'
                                            ) : canRedeem ? (
                                                'Tukar'
                                            ) : (
                                                'Koin Kurang'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <h3 className="font-medium text-blue-800 mb-2">Informasi</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Voucher akan masuk ke akun Anda setelah penukaran</li>
                            <li>• Voucher berlaku 30 hari sejak penukaran</li>
                            <li>• Tidak dapat digabung dengan promo lain</li>
                        </ul>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

