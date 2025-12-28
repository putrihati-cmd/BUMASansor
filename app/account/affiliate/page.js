'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Affiliate Dashboard Page
 * Dashboard for affiliates to manage their account
 */
export default function AffiliateDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [affiliate, setAffiliate] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Commission tier info
    const tiers = {
        BRONZE: { name: 'Bronze', rate: '5%', color: 'bg-amber-600' },
        SILVER: { name: 'Silver', rate: '7%', color: 'bg-gray-400' },
        GOLD: { name: 'Gold', rate: '10%', color: 'bg-yellow-500' },
        PLATINUM: { name: 'Platinum', rate: '15%', color: 'bg-purple-500' }
    };

    const fetchAffiliateData = useCallback(async () => {
        try {
            // Fetch affiliate status
            const res = await fetch('/api/affiliate/register');
            const data = await res.json();

            if (!data.registered) {
                router.push('/account/affiliate/register');
                return;
            }

            setAffiliate(data.affiliate);

            // Fetch withdrawals
            const withdrawRes = await fetch('/api/affiliate/withdraw');
            const withdrawData = await withdrawRes.json();
            setWithdrawals(withdrawData.withdrawals || []);

        } catch (error) {
            console.error('Error fetching affiliate data:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchAffiliateData();
    }, [fetchAffiliateData]);


    const handleWithdraw = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/affiliate/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Withdrawal failed');
            }

            alert('Permintaan penarikan berhasil dibuat!');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            fetchAffiliateData();

        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const copyReferralLink = () => {
        const link = `${window.location.origin}?ref=${affiliate.referralCode}`;
        navigator.clipboard.writeText(link);
        alert('Link referral berhasil disalin!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Affiliate Dashboard</h1>
                    <p className="text-gray-600">Kelola akun affiliate Anda</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* Tier Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 ${tiers[affiliate.tier].color} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-lg">⭐</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tier</p>
                                <p className="font-bold text-lg">{tiers[affiliate.tier].name}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Komisi: {tiers[affiliate.tier].rate}</p>
                    </div>

                    {/* Total Earnings */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(affiliate.totalEarnings)}
                        </p>
                    </div>

                    {/* Available Balance */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Saldo Tersedia</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(affiliate.availableBalance)}
                        </p>
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            disabled={affiliate.availableBalance < 100000}
                            className="mt-2 text-sm text-blue-600 hover:underline disabled:text-gray-400"
                        >
                            Tarik Dana
                        </button>
                    </div>

                    {/* Total Referrals */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Total Referral</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {affiliate.totalReferrals}
                        </p>
                    </div>
                </div>

                {/* Referral Link Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white mb-8">
                    <h3 className="text-lg font-semibold mb-2">🔗 Link Referral Anda</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-sm truncate">
                            {typeof window !== 'undefined' && `${window.location.origin}?ref=${affiliate.referralCode}`}
                        </div>
                        <button
                            onClick={copyReferralLink}
                            className="bg-white text-emerald-600 px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                        >
                            Salin
                        </button>
                    </div>
                    <p className="text-sm text-white/80 mt-2">
                        Kode: <span className="font-bold">{affiliate.referralCode}</span>
                    </p>
                </div>

                {/* Withdrawal History */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="font-semibold">Riwayat Penarikan</h3>
                    </div>
                    {withdrawals.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Belum ada riwayat penarikan
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Jumlah</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {withdrawals.map((w) => (
                                        <tr key={w.id}>
                                            <td className="px-6 py-4 text-sm">
                                                {new Date(w.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {formatCurrency(w.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${w.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    w.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        w.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Tarik Dana</h3>
                        <form onSubmit={handleWithdraw}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jumlah Penarikan
                                </label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    min="100000"
                                    max={affiliate.availableBalance}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Minimal Rp 100.000"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Saldo tersedia: {formatCurrency(affiliate.availableBalance)}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Memproses...' : 'Tarik Dana'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

