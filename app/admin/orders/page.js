'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, ChevronLeft, ChevronRight, Download, RefreshCw, ShoppingBag } from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';

const statusConfig = {
    PENDING_PAYMENT: { label: 'Menunggu Bayar', color: 'warning' },
    PAID: { label: 'Dibayar', color: 'primary' },
    PROCESSING: { label: 'Diproses', color: 'primary' },
    SHIPPED: { label: 'Dikirim', color: 'primary' },
    DELIVERED: { label: 'Diterima', color: 'success' },
    COMPLETED: { label: 'Selesai', color: 'success' },
    CANCELLED: { label: 'Dibatalkan', color: 'danger' },
    FAILED: { label: 'Gagal', color: 'danger' },
    REFUNDED: { label: 'Refund', color: 'danger' },
};

const statusFilters = [
    { value: '', label: 'Semua Status' },
    { value: 'PENDING_PAYMENT', label: 'Menunggu Bayar' },
    { value: 'PAID', label: 'Dibayar' },
    { value: 'PROCESSING', label: 'Diproses' },
    { value: 'SHIPPED', label: 'Dikirim' },
    { value: 'DELIVERED', label: 'Diterima' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/orders?${params}`);
            const data = await res.json();

            if (data.success) {
                setOrders(data.orders || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotal(data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const filteredOrders = orders.filter((order) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return order.orderNumber?.toLowerCase().includes(searchLower) ||
            order.user?.name?.toLowerCase().includes(searchLower) ||
            order.user?.email?.toLowerCase().includes(searchLower);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Pesanan</h1>
                    <p className="text-neutral-500">Kelola semua pesanan pelanggan ({total} total)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="secondary">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari nomor pesanan atau nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                    >
                        {statusFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                                {filter.label}
                            </option>
                        ))}
                    </select>
                    <Button type="submit">Cari</Button>
                </form>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-neutral-500">Memuat pesanan...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">No. Pesanan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Pelanggan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Items</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Tanggal</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-4">
                                            <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary-500 hover:underline">
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-neutral-800">{order.user?.name || order.guestName || 'Guest'}</p>
                                            <p className="text-sm text-neutral-500">{order.user?.email || order.guestEmail || '-'}</p>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600">{order.items?.length || order._count?.items || 0} item</td>
                                        <td className="px-4 py-4 font-semibold text-neutral-800">{formatRupiah(order.total)}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusConfig[order.status]?.color || 'secondary'}>
                                                {statusConfig[order.status]?.label || order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600">
                                            {formatDate(order.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-50 rounded-lg"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredOrders.length === 0 && (
                    <div className="p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Tidak ada pesanan</h3>
                        <p className="text-neutral-500">Belum ada pesanan yang sesuai filter</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && orders.length > 0 && (
                    <div className="px-4 py-4 border-t border-neutral-100 flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Halaman {page} dari {totalPages} ({total} pesanan)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium">Page {page}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

