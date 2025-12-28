'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Copy, Check, Tag, RefreshCw } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { formatRupiah, formatDate } from '@/lib/utils';

const typeConfig = {
    PERCENTAGE: { label: 'Persentase', color: 'primary' },
    FIXED: { label: 'Nominal', color: 'success' },
    FIXED_AMOUNT: { label: 'Nominal', color: 'success' },
    FREE_SHIPPING: { label: 'Gratis Ongkir', color: 'secondary' },
};

const statusConfig = {
    ACTIVE: { label: 'Aktif', color: 'success' },
    INACTIVE: { label: 'Nonaktif', color: 'secondary' },
    EXPIRED: { label: 'Kadaluarsa', color: 'danger' },
};

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, totalUsage: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vouchers');
            const data = await res.json();

            if (data.success || Array.isArray(data.vouchers) || Array.isArray(data)) {
                const voucherList = data.vouchers || data || [];
                setVouchers(voucherList);

                // Calculate stats
                const active = voucherList.filter(v => v.isActive && new Date(v.validUntil) > new Date()).length;
                const totalUsage = voucherList.reduce((sum, v) => sum + (v.usedCount || 0), 0);
                setStats({ total: voucherList.length, active, totalUsage });
            }
        } catch (error) {
            console.error('Failed to fetch vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus voucher ini?')) return;

        try {
            const res = await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('✅ Voucher dihapus');
                fetchVouchers();
            } else {
                alert('❌ Gagal menghapus');
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan');
        }
    };

    const getVoucherStatus = (voucher) => {
        if (!voucher.isActive) return 'INACTIVE';
        if (new Date(voucher.validUntil) < new Date()) return 'EXPIRED';
        return 'ACTIVE';
    };

    const filteredVouchers = vouchers.filter((voucher) =>
        voucher.code?.toLowerCase().includes(search.toLowerCase()) ||
        voucher.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Voucher</h1>
                    <p className="text-neutral-500">Kelola voucher dan promo toko Anda</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={fetchVouchers} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Link href="/admin/vouchers/new">
                        <Button>
                            <Plus className="w-4 h-4" />
                            Buat Voucher
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Total Voucher</p>
                    <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Voucher Aktif</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Total Penggunaan</p>
                    <p className="text-2xl font-bold text-primary-500">{stats.totalUsage}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari kode voucher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="p-12 text-center bg-white rounded-xl shadow-sm">
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-neutral-500">Memuat voucher...</p>
                </div>
            )}

            {/* Vouchers Grid */}
            {!loading && (
                <div className="grid md:grid-cols-2 gap-6">
                    {filteredVouchers.map((voucher) => {
                        const status = getVoucherStatus(voucher);
                        const voucherType = voucher.type || 'FIXED';

                        return (
                            <div key={voucher.id} className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-neutral-100">
                                {/* Header */}
                                <div className="p-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Tag className="w-6 h-6" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold font-mono">{voucher.code}</h3>
                                                    <button
                                                        onClick={() => handleCopyCode(voucher.code, voucher.id)}
                                                        className="p-1 hover:bg-white/20 rounded"
                                                    >
                                                        {copiedId === voucher.id ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-white/80 text-sm">{voucher.name}</p>
                                            </div>
                                        </div>
                                        <Badge variant={statusConfig[status]?.color || 'secondary'}>
                                            {statusConfig[status]?.label || status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-500">Nilai Diskon</span>
                                        <span className="font-bold text-primary-500">
                                            {voucherType === 'PERCENTAGE'
                                                ? `${voucher.value}%`
                                                : voucherType === 'FREE_SHIPPING'
                                                    ? 'Gratis Ongkir'
                                                    : formatRupiah(voucher.value)}
                                        </span>
                                    </div>

                                    {voucher.maxDiscount > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-neutral-500">Maks Diskon</span>
                                            <span className="font-medium text-neutral-800">{formatRupiah(voucher.maxDiscount)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-500">Min Pembelian</span>
                                        <span className="font-medium text-neutral-800">{formatRupiah(voucher.minPurchase || 0)}</span>
                                    </div>

                                    {/* Usage */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-neutral-500">Penggunaan</span>
                                            <span className="font-medium text-neutral-800">
                                                {voucher.usedCount || 0} / {voucher.usageLimit || '∞'}
                                            </span>
                                        </div>
                                        {voucher.usageLimit > 0 && (
                                            <div className="w-full bg-neutral-100 rounded-full h-2">
                                                <div
                                                    className="bg-primary-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, ((voucher.usedCount || 0) / voucher.usageLimit) * 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Period */}
                                    <div className="pt-4 border-t border-neutral-100">
                                        <p className="text-sm text-neutral-500 mb-1">Periode Berlaku</p>
                                        <p className="text-sm font-medium text-neutral-800">
                                            {formatDate(voucher.validFrom, { day: 'numeric', month: 'short' })} - {formatDate(voucher.validUntil, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-5 py-4 bg-neutral-50 flex gap-2">
                                    <Link href={`/admin/vouchers/${voucher.id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-white rounded-lg">
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(voucher.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg ml-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredVouchers.length === 0 && (
                <div className="p-12 text-center bg-white rounded-xl shadow-sm">
                    <Tag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Tidak ada voucher</h3>
                    <p className="text-neutral-500 mb-4">Buat voucher pertama Anda</p>
                    <Link href="/admin/vouchers/new">
                        <Button>
                            <Plus className="w-4 h-4" />
                            Buat Voucher
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

