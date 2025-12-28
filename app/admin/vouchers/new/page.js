'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewVoucherPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        maxUses: 0,
        expiresAt: '',
        isActive: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Voucher berhasil dibuat!');
                router.push('/admin/vouchers');
            } else {
                const data = await res.json();
                alert(data.error || 'Gagal membuat voucher');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Buat Voucher Baru</h1>
                <button
                    onClick={() => router.push('/admin/vouchers')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    ← Kembali
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Kode Voucher</label>
                    <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="DISKON50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tipe Diskon</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                    >
                        <option value="PERCENTAGE">Persentase (%)</option>
                        <option value="FIXED">Nominal (Rp)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Nilai Diskon {formData.type === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Min. Pembelian (Rp)</label>
                    <input
                        type="number"
                        min="0"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>

                {formData.type === 'PERCENTAGE' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Max. Diskon (Rp)</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.maxDiscount}
                            onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2">Max. Penggunaan</label>
                    <input
                        type="number"
                        min="0"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="0 = unlimited"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tanggal Kadaluarsa</label>
                    <input
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2"
                    />
                    <label className="text-sm font-medium">Aktifkan voucher</label>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Voucher'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/vouchers')}
                        className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}

