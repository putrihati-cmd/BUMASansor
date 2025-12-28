'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowLeft, Target, Coins, Check, ShoppingBag, Star, Calendar, Share2 } from 'lucide-react';
import useUserStore from '@/store/user';
import FeatureDisabledPage from '@/components/FeatureDisabled';

// Daftar misi yang bisa diselesaikan
const MISSIONS = [
    {
        id: 'daily_login',
        name: 'Login Harian',
        description: 'Login ke akun Anda hari ini',
        coins: 10,
        icon: Calendar,
        type: 'daily',
        progress: 1,
        target: 1,
    },
    {
        id: 'first_purchase',
        name: 'Pembelian Pertama',
        description: 'Selesaikan 1 transaksi',
        coins: 50,
        icon: ShoppingBag,
        type: 'one_time',
        progress: 0,
        target: 1,
    },
    {
        id: 'write_review',
        name: 'Tulis Review',
        description: 'Berikan review untuk produk yang sudah dibeli',
        coins: 30,
        icon: Star,
        type: 'repeatable',
        progress: 0,
        target: 1,
    },
    {
        id: 'share_product',
        name: 'Bagikan Produk',
        description: 'Bagikan produk ke media sosial',
        coins: 15,
        icon: Share2,
        type: 'daily',
        progress: 0,
        target: 1,
    },
    {
        id: 'spend_100k',
        name: 'Belanja Rp 100.000',
        description: 'Belanja minimal Rp 100.000 dalam 1 transaksi',
        coins: 100,
        icon: ShoppingBag,
        type: 'repeatable',
        progress: 0,
        target: 1,
    },
];

export default function MissionsPage() {
    const router = useRouter();
    const { isAuthenticated } = useUserStore();
    const [missions, setMissions] = useState(MISSIONS);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);
    const [featureEnabled, setFeatureEnabled] = useState(null);

    useEffect(() => {
        // Check feature flag first
        fetch('/api/features')
            .then(res => res.json())
            .then(data => {
                setFeatureEnabled(data.features?.POINTS_MISSIONS ?? false);
            })
            .catch(() => setFeatureEnabled(false));

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        // Simulate loading user missions progress
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, [isAuthenticated]);

    const handleClaim = async (missionId) => {
        setClaiming(missionId);
        try {
            // TODO: Implement API call
            // const response = await fetch('/api/points/claim-mission', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ missionId }),
            // });

            // Simulate success
            setTimeout(() => {
                setMissions(prev => prev.map(m =>
                    m.id === missionId ? { ...m, claimed: true } : m
                ));
                setClaiming(null);
            }, 1000);
        } catch (error) {
            alert('Gagal klaim hadiah');
            setClaiming(null);
        }
    };

    const getMissionStatus = (mission) => {
        if (mission.claimed) return 'claimed';
        if (mission.progress >= mission.target) return 'completed';
        return 'in_progress';
    };

    // Show feature disabled page if not enabled
    if (featureEnabled === false) {
        return (
            <FeatureDisabledPage
                featureName="Misi Harian"
                description="Fitur misi harian untuk mendapatkan koin sedang dalam pengembangan."
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
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Misi Harian</h1>
                        </div>
                        <p className="opacity-80">Selesaikan misi dan dapatkan koin!</p>
                    </div>

                    {/* Missions List */}
                    <div className="space-y-4">
                        {missions.map((mission) => {
                            const status = getMissionStatus(mission);
                            const Icon = mission.icon;
                            const isClaiming = claiming === mission.id;
                            const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);

                            return (
                                <div
                                    key={mission.id}
                                    className={`bg-white rounded-xl p-4 shadow-sm ${status === 'claimed' ? 'opacity-60' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status === 'claimed' ? 'bg-green-100' :
                                            status === 'completed' ? 'bg-primary-100' : 'bg-neutral-100'
                                            }`}>
                                            {status === 'claimed' ? (
                                                <Check className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <Icon className={`w-6 h-6 ${status === 'completed' ? 'text-primary-500' : 'text-neutral-400'
                                                    }`} />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-neutral-800">{mission.name}</h3>
                                                <div className="flex items-center gap-1 text-primary-500">
                                                    <Coins className="w-4 h-4" />
                                                    <span className="font-bold">+{mission.coins}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-500 mb-2">{mission.description}</p>

                                            {/* Progress Bar */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${status === 'claimed' ? 'bg-green-500' : 'bg-primary-500'
                                                            }`}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-neutral-500">
                                                    {mission.progress}/{mission.target}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Claim Button */}
                                        {status === 'completed' && (
                                            <button
                                                onClick={() => handleClaim(mission.id)}
                                                disabled={isClaiming}
                                                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50"
                                            >
                                                {isClaiming ? '...' : 'Klaim'}
                                            </button>
                                        )}
                                        {status === 'claimed' && (
                                            <span className="px-4 py-2 bg-green-100 text-green-600 rounded-lg font-medium">
                                                Diklaim
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                        <h3 className="font-medium text-yellow-800 mb-2">Tips</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Misi harian akan reset setiap pukul 00:00</li>
                            <li>• Klaim hadiah sebelum misi reset</li>
                            <li>• Misi khusus bisa dikerjakan berulang kali</li>
                        </ul>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

