'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Affiliate Registration Page
 */
export default function AffiliateRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bank: '',
        accountNumber: '',
        accountName: ''
    });

    const banks = [
        'BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga',
        'Bank Permata', 'Bank Danamon', 'Bank BTPN', 'Bank Mega'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/affiliate/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bankAccount: formData })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            alert('Registrasi affiliate berhasil! Kode referral Anda: ' + data.affiliate.referralCode);
            router.push('/account/affiliate');

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl">🤝</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Program Affiliate</h1>
                    <p className="text-gray-600 mt-2">
                        Dapatkan komisi dari setiap penjualan yang Anda referensikan
                    </p>
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="font-semibold text-lg mb-4">🎁 Keuntungan Menjadi Affiliate</h2>
                    <div className="grid gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span>💰</span>
                            </div>
                            <div>
                                <p className="font-medium">Komisi hingga 15%</p>
                                <p className="text-sm text-gray-500">Mulai dari 5% (Bronze) sampai 15% (Platinum)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span>🔗</span>
                            </div>
                            <div>
                                <p className="font-medium">Link Referral Unik</p>
                                <p className="text-sm text-gray-500">Bagikan link Anda di sosial media</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span>📊</span>
                            </div>
                            <div>
                                <p className="font-medium">Dashboard Lengkap</p>
                                <p className="text-sm text-gray-500">Pantau referral dan komisi real-time</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span>⚡</span>
                            </div>
                            <div>
                                <p className="font-medium">Pencairan Cepat</p>
                                <p className="text-sm text-gray-500">Tarik komisi minimal Rp 100.000</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tier Info */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 mb-6 text-white">
                    <h2 className="font-semibold text-lg mb-3">📈 Tier & Komisi</h2>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white/20 rounded-lg p-3">
                            <p className="text-2xl">🥉</p>
                            <p className="font-bold">Bronze</p>
                            <p className="text-sm">5%</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <p className="text-2xl">🥈</p>
                            <p className="font-bold">Silver</p>
                            <p className="text-sm">7%</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <p className="text-2xl">🥇</p>
                            <p className="font-bold">Gold</p>
                            <p className="text-sm">10%</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <p className="text-2xl">💎</p>
                            <p className="font-bold">Platinum</p>
                            <p className="text-sm">15%</p>
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="font-semibold text-lg mb-4">📝 Daftar Sekarang</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bank
                            </label>
                            <select
                                value={formData.bank}
                                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Pilih Bank</option>
                                {banks.map((bank) => (
                                    <option key={bank} value={bank}>{bank}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Rekening
                            </label>
                            <input
                                type="text"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="1234567890"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Pemilik Rekening
                            </label>
                            <input
                                type="text"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                placeholder="Sesuai buku tabungan"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <input type="checkbox" required className="mt-1" />
                            <p>
                                Saya menyetujui <a href="/terms" className="text-emerald-600 hover:underline">Syarat & Ketentuan</a> program affiliate Infiatin Store
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition"
                        >
                            {loading ? '⏳ Mendaftar...' : '🚀 Daftar Affiliate'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

