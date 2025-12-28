'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowLeft, Coins, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import useUserStore from '@/store/user';

const typeConfig = {
    EARN_PURCHASE: { label: 'Belanja', icon: '🛒', color: 'text-green-500' },
    EARN_REVIEW: { label: 'Review', icon: '⭐', color: 'text-green-500' },
    EARN_DAILY: { label: 'Check-in', icon: '📅', color: 'text-green-500' },
    EARN_MISSION: { label: 'Misi', icon: '🎯', color: 'text-green-500' },
    EARN_REFERRAL: { label: 'Referral', icon: '👥', color: 'text-green-500' },
    REDEEM: { label: 'Tukar Voucher', icon: '🎁', color: 'text-red-500' },
    EXPIRE: { label: 'Kadaluarsa', icon: '⏰', color: 'text-neutral-500' },
    ADMIN_ADJUST: { label: 'Penyesuaian', icon: '⚙️', color: 'text-blue-500' },
};

export default function PointsHistoryPage() {
    const router = useRouter();
    const { isAuthenticated } = useUserStore();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, earn, spend

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        fetchHistory();
    }, [isAuthenticated]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/points?includeHistory=true&limit=100');
            const data = await response.json();
            if (data.success) {
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'earn') return tx.amount > 0;
        if (filter === 'spend') return tx.amount < 0;
        return true;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-neutral-50 pt-4 pb-20">
                    <div className="container-app">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-neutral-200 rounded w-1/3" />
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-neutral-200 rounded" />
                            ))}
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
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold text-neutral-800">Riwayat Koin</h1>

                        {/* Filter */}
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilter('earn')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${filter === 'earn' ? 'bg-green-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                            >
                                <TrendingUp className="w-3 h-3" /> Dapat
                            </button>
                            <button
                                onClick={() => setFilter('spend')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${filter === 'spend' ? 'bg-red-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                            >
                                <TrendingDown className="w-3 h-3" /> Pakai
                            </button>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="bg-white rounded-xl shadow-sm divide-y divide-neutral-100">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx) => {
                                const config = typeConfig[tx.type] || { label: tx.type, icon: '💰', color: 'text-neutral-500' };

                                return (
                                    <div key={tx.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{config.icon}</span>
                                            <div>
                                                <p className="font-medium text-neutral-800">{tx.description}</p>
                                                <p className="text-xs text-neutral-500">{formatDate(tx.createdAt)}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-neutral-500">
                                <Coins className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                                <p>Belum ada riwayat koin</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

