'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coins, Gift, TrendingUp, Calendar, ChevronRight, RefreshCw, Clock } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Badge } from '@/components/ui';
import { formatRupiah } from '@/lib/utils';
import useUserStore from '@/store/user';

const typeConfig = {
    EARN_PURCHASE: { label: 'Pembelian', color: 'success', icon: '🛒' },
    EARN_REVIEW: { label: 'Review', color: 'success', icon: '⭐' },
    EARN_DAILY: { label: 'Check-in', color: 'success', icon: '📅' },
    EARN_MISSION: { label: 'Misi', color: 'success', icon: '🎯' },
    EARN_REFERRAL: { label: 'Referral', color: 'success', icon: '👥' },
    REDEEM: { label: 'Tukar', color: 'danger', icon: '🎁' },
    EXPIRE: { label: 'Kadaluarsa', color: 'secondary', icon: '⏰' },
    ADMIN_ADJUST: { label: 'Admin', color: 'secondary', icon: '⚙️' },
};

export default function PointsPage() {
    const router = useRouter();
    const { isAuthenticated } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [pointsData, setPointsData] = useState({
        balance: 0,
        lifetime: 0,
        value: 0,
        canCheckin: false,
        transactions: [],
        config: {},
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login?redirect=/account/points');
            return;
        }
        fetchPoints();
    }, [isAuthenticated]);

    const fetchPoints = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/points', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPointsData(data);
            }
        } catch (error) {
            console.error('Fetch points error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckin = async () => {
        setCheckingIn(true);
        try {
            const res = await fetch('/api/points/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await res.json();
            if (res.ok) {
                alert(`🎉 ${data.message}`);
                fetchPoints();
            } else {
                alert('❌ ' + data.error);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setCheckingIn(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="flex-1 bg-neutral-50 py-8">
                    <div className="container-app flex items-center justify-center h-64">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="flex-1 bg-neutral-50">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white">
                    <div className="container-app py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins className="w-6 h-6" />
                                    <span className="font-medium">Koin Saya</span>
                                </div>
                                <p className="text-4xl font-bold">{pointsData.balance.toLocaleString()}</p>
                                <p className="text-sm opacity-80 mt-1">
                                    Setara {formatRupiah(pointsData.value)} diskon
                                </p>
                            </div>

                            {/* Daily Check-in */}
                            <div className="text-center">
                                <Button
                                    onClick={handleCheckin}
                                    disabled={!pointsData.canCheckin || checkingIn}
                                    className={`${pointsData.canCheckin ? 'bg-white text-orange-500 hover:bg-neutral-100' : 'bg-white/30 text-white'}`}
                                >
                                    {checkingIn ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Calendar className="w-4 h-4" />
                                    )}
                                    {pointsData.canCheckin ? 'Check-in Hari Ini' : 'Sudah Check-in'}
                                </Button>
                                <p className="text-xs mt-2 opacity-80">
                                    +{pointsData.config.DAILY_CHECKIN || 10} koin per hari
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-app py-6 space-y-6">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/account/points/redeem" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                                <Gift className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="font-semibold text-neutral-800">Tukar Koin</h3>
                            <p className="text-xs text-neutral-500">Dapatkan diskon</p>
                        </Link>

                        <Link href="/account/points/missions" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="font-semibold text-neutral-800">Misi</h3>
                            <p className="text-xs text-neutral-500">Selesaikan & dapat koin</p>
                        </Link>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                <Coins className="w-5 h-5 text-green-500" />
                            </div>
                            <h3 className="font-semibold text-neutral-800">Total Dapat</h3>
                            <p className="text-xs text-neutral-500">{pointsData.lifetime.toLocaleString()} koin</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <h3 className="font-semibold text-neutral-800">Rate</h3>
                            <p className="text-xs text-neutral-500">1 koin = {formatRupiah(pointsData.config.POINT_VALUE || 100)}</p>
                        </div>
                    </div>

                    {/* How to Earn */}
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h2 className="font-semibold text-neutral-800 mb-4">Cara Dapat Koin</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🛒</span>
                                    <span className="text-neutral-700">Belanja</span>
                                </div>
                                <span className="text-sm text-primary-500 font-medium">1 koin / Rp{pointsData.config.EARN_RATE || 100}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⭐</span>
                                    <span className="text-neutral-700">Tulis Review</span>
                                </div>
                                <span className="text-sm text-primary-500 font-medium">+{pointsData.config.REVIEW_BONUS || 50} koin</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📅</span>
                                    <span className="text-neutral-700">Daily Check-in</span>
                                </div>
                                <span className="text-sm text-primary-500 font-medium">+{pointsData.config.DAILY_CHECKIN || 10} koin</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">✅</span>
                                    <span className="text-neutral-700">Selesaikan Pesanan</span>
                                </div>
                                <span className="text-sm text-primary-500 font-medium">+{pointsData.config.ORDER_BONUS || 20} koin</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="font-semibold text-neutral-800">Riwayat Koin</h2>
                            <Link href="/account/points/history" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
                                Lihat Semua <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {pointsData.transactions.length > 0 ? (
                                pointsData.transactions.map((tx) => (
                                    <div key={tx.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{typeConfig[tx.type]?.icon || '💰'}</span>
                                            <div>
                                                <p className="font-medium text-neutral-800">{tx.description}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-neutral-500">
                                    <Coins className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                                    <p>Belum ada riwayat koin</p>
                                    <p className="text-sm">Mulai berbelanja untuk mendapatkan koin!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

