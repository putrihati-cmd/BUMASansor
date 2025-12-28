'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Download, Trash2, RefreshCw, Users } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const statusConfig = {
    ACTIVE: { label: 'Aktif', color: 'success' },
    UNSUBSCRIBED: { label: 'Unsubscribed', color: 'secondary' },
};

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, [statusFilter]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/newsletter?${params}`);
            const data = await res.json();

            if (data.success) {
                setSubscribers(data.subscribers || []);
                setStats(data.stats || { total: 0, active: 0, unsubscribed: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const activeSubscribers = subscribers.filter(s => s.status === 'ACTIVE');
            const csv = ['email,subscribedAt'];
            activeSubscribers.forEach(s => {
                csv.push(`${s.email},${s.subscribedAt || s.createdAt}`);
            });

            const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('❌ Gagal export data');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus subscriber ini?')) return;

        try {
            const res = await fetch(`/api/admin/newsletter?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('✅ Subscriber dihapus');
                fetchSubscribers();
            } else {
                alert('❌ Gagal menghapus');
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan');
        }
    };

    const filteredSubscribers = subscribers.filter((sub) => {
        if (!search) return true;
        return sub.email?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Newsletter Subscribers</h1>
                    <p className="text-neutral-500">Kelola subscriber newsletter</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExport}>
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button variant="secondary" onClick={fetchSubscribers} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Total Subscriber</p>
                    <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Aktif</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-1">Unsubscribed</p>
                    <p className="text-2xl font-bold text-neutral-500">{stats.unsubscribed}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari email..."
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
                        <option value="ACTIVE">Aktif</option>
                        <option value="UNSUBSCRIBED">Unsubscribed</option>
                    </select>
                </div>
            </div>

            {/* Subscribers Table */}
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Tanggal Subscribe</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredSubscribers.map((subscriber) => (
                                    <tr key={subscriber.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-neutral-400" />
                                                <span className="text-neutral-800">{subscriber.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusConfig[subscriber.status]?.color || 'secondary'}>
                                                {statusConfig[subscriber.status]?.label || subscriber.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-neutral-500">
                                            {formatDate(subscriber.subscribedAt || subscriber.createdAt, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(subscriber.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredSubscribers.length === 0 && (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Tidak ada subscriber</h3>
                        <p className="text-neutral-500">Belum ada yang subscribe newsletter</p>
                    </div>
                )}
            </div>
        </div>
    );
}

