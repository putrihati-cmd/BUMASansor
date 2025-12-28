'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Eye, Check, X, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { Button, Badge, Modal } from '@/components/ui';
import { formatRupiah, formatDate } from '@/lib/utils';

const typeConfig = {
    PRODUCT_ISSUE: { label: 'Produk Bermasalah', icon: AlertCircle },
    WRONG_ITEM: { label: 'Barang Salah', icon: AlertCircle },
    NOT_RECEIVED: { label: 'Tidak Diterima', icon: AlertCircle },
    OTHER: { label: 'Lainnya', icon: AlertCircle },
};

const statusConfig = {
    PENDING: { label: 'Menunggu', color: 'warning' },
    APPROVED: { label: 'Disetujui', color: 'success' },
    REJECTED: { label: 'Ditolak', color: 'danger' },
    PROCESSED: { label: 'Diproses', color: 'primary' },
    COMPLETED: { label: 'Selesai', color: 'success' },
};

export default function RefundsPage() {
    const [refunds, setRefunds] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [rejectNote, setRejectNote] = useState('');

    const fetchRefunds = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/refunds?${params}`);
            const data = await res.json();

            if (data.success) {
                setRefunds(data.refunds || []);
                setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch refunds:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        fetchRefunds();
    }, [fetchRefunds]);

    const handleApprove = async (id) => {
        if (!confirm('Setujui refund ini?')) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/admin/refunds', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'APPROVED' }),
            });

            if (res.ok) {
                alert('✅ Refund disetujui');
                setSelectedRefund(null);
                fetchRefunds();
            } else {
                alert('❌ Gagal menyetujui refund');
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan');
        } finally {
            setUpdating(false);
        }
    };

    const handleReject = async (id) => {
        if (!rejectNote.trim()) {
            alert('Masukkan alasan penolakan');
            return;
        }

        setUpdating(true);
        try {
            const res = await fetch('/api/admin/refunds', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'REJECTED', note: rejectNote }),
            });

            if (res.ok) {
                alert('✅ Refund ditolak');
                setSelectedRefund(null);
                setRejectNote('');
                fetchRefunds();
            } else {
                alert('❌ Gagal menolak refund');
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan');
        } finally {
            setUpdating(false);
        }
    };

    const filteredRefunds = refunds.filter((refund) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return refund.order?.orderNumber?.toLowerCase().includes(searchLower) ||
            refund.user?.name?.toLowerCase().includes(searchLower) ||
            refund.user?.email?.toLowerCase().includes(searchLower);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Refund Requests</h1>
                    <p className="text-neutral-500">Kelola permintaan refund dari pelanggan</p>
                </div>
                <Button variant="secondary" onClick={fetchRefunds} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Menunggu</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Ditolak</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari order number atau nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="APPROVED">Disetujui</option>
                        <option value="REJECTED">Ditolak</option>
                        <option value="COMPLETED">Selesai</option>
                    </select>
                </div>
            </div>

            {/* Refunds Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-neutral-500">Memuat data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Order</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Pelanggan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Alasan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Jumlah</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredRefunds.map((refund) => (
                                    <tr key={refund.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-primary-500">{refund.order?.orderNumber}</p>
                                            <p className="text-xs text-neutral-500">
                                                {formatDate(refund.createdAt, { day: 'numeric', month: 'short' })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-neutral-800">{refund.user?.name}</p>
                                            <p className="text-sm text-neutral-500">{refund.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-neutral-700 line-clamp-2">{refund.reason}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-semibold text-neutral-800">
                                                {formatRupiah(refund.amount || refund.order?.total || 0)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusConfig[refund.status]?.color || 'secondary'}>
                                                {statusConfig[refund.status]?.label || refund.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedRefund(refund)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-50 rounded-lg"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredRefunds.length === 0 && (
                    <div className="p-12 text-center">
                        <RotateCcw className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Tidak ada refund</h3>
                        <p className="text-neutral-500">Belum ada permintaan refund</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRefund && (
                <Modal
                    isOpen={!!selectedRefund}
                    onClose={() => { setSelectedRefund(null); setRejectNote(''); }}
                    title="Detail Refund"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-500">Order Number</label>
                                <p className="text-primary-500 font-medium">{selectedRefund.order?.orderNumber}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-500">Jumlah Refund</label>
                                <p className="text-neutral-800 font-bold">
                                    {formatRupiah(selectedRefund.amount || selectedRefund.order?.total || 0)}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-500">Pelanggan</label>
                            <p className="text-neutral-800">{selectedRefund.user?.name}</p>
                            <p className="text-sm text-neutral-500">{selectedRefund.user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-500">Alasan Refund</label>
                            <p className="text-neutral-800 whitespace-pre-wrap">{selectedRefund.reason}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-500">Status</label>
                            <div className="mt-1">
                                <Badge variant={statusConfig[selectedRefund.status]?.color}>
                                    {statusConfig[selectedRefund.status]?.label}
                                </Badge>
                            </div>
                        </div>

                        {selectedRefund.status === 'PENDING' && (
                            <div className="border-t pt-4 space-y-3">
                                <textarea
                                    rows={2}
                                    placeholder="Catatan/alasan penolakan (wajib jika ditolak)"
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 mt-6">
                        {selectedRefund.status === 'PENDING' && (
                            <>
                                <Button
                                    variant="success"
                                    onClick={() => handleApprove(selectedRefund.id)}
                                    disabled={updating}
                                >
                                    <Check className="w-4 h-4" />
                                    {updating ? 'Memproses...' : 'Setujui'}
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleReject(selectedRefund.id)}
                                    disabled={updating}
                                >
                                    <X className="w-4 h-4" />
                                    {updating ? 'Memproses...' : 'Tolak'}
                                </Button>
                            </>
                        )}
                        <Button variant="secondary" onClick={() => { setSelectedRefund(null); setRejectNote(''); }}>
                            Tutup
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

