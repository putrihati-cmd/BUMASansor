'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Mail, Phone, ChevronLeft, ChevronRight, RefreshCw, Users } from 'lucide-react';
import { formatDate, formatRupiah } from '@/lib/utils';
import { Badge, Button } from '@/components/ui';

const statusConfig = {
    ACTIVE: { label: 'Aktif', color: 'success' },
    SUSPENDED: { label: 'Suspend', color: 'danger' },
    INACTIVE: { label: 'Tidak Aktif', color: 'secondary' },
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCustomers();
    }, [page, statusFilter]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/customers?${params}`);
            const data = await res.json();

            if (data.success) {
                setCustomers(data.customers || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setStats({
                    total: data.pagination?.total || data.customers?.length || 0,
                    active: data.stats?.active || data.customers?.filter(c => c.status === 'ACTIVE').length || 0,
                    newThisMonth: data.stats?.newThisMonth || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers();
    };

    const filteredCustomers = customers.filter((customer) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return customer.name?.toLowerCase().includes(searchLower) ||
            customer.email?.toLowerCase().includes(searchLower);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Pelanggan</h1>
                    <p className="text-neutral-500">Kelola data pelanggan toko Anda</p>
                </div>
                <Button variant="secondary" onClick={fetchCustomers} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Total Pelanggan</p>
                    <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Pelanggan Aktif</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">New This Month</p>
                    <p className="text-2xl font-bold text-primary-500">{stats.newThisMonth}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
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
                        <option value="">Semua Status</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="SUSPENDED">Suspend</option>
                    </select>
                    <Button type="submit">Cari</Button>
                </form>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-neutral-500">Memuat pelanggan...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Pelanggan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Kontak</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Total Pesanan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Total Belanja</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Bergabung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-neutral-800">{customer.name || 'Guest'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-neutral-600 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {customer.email || '-'}
                                                </p>
                                                <p className="text-sm text-neutral-600 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone || '-'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600">
                                            {customer._count?.orders || customer.totalOrders || 0}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-neutral-800">
                                            {formatRupiah(customer.totalSpent || 0)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusConfig[customer.status || 'ACTIVE']?.color || 'secondary'}>
                                                {statusConfig[customer.status || 'ACTIVE']?.label || 'Aktif'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-neutral-500">
                                            {formatDate(customer.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredCustomers.length === 0 && (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Tidak ada pelanggan</h3>
                        <p className="text-neutral-500">Belum ada pelanggan terdaftar</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && customers.length > 0 && (
                    <div className="px-4 py-4 border-t border-neutral-100 flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Halaman {page} dari {totalPages}
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

