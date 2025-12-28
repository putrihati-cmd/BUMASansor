'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Zap, Calendar, Package, TrendingUp, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { formatRupiah, formatDate } from '@/lib/utils';

const statusConfig = {
    UPCOMING: { label: 'Akan Datang', color: 'secondary' },
    ACTIVE: { label: 'Aktif', color: 'success' },
    ENDED: { label: 'Berakhir', color: 'danger' },
};

export default function FlashSalesPage() {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        bannerUrl: '',
        startTime: '',
        endTime: '',
        products: [],
    });

    useEffect(() => {
        fetchFlashSales();
    }, []);

    const fetchFlashSales = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/flash-sales', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setFlashSales(data.flashSales);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/flash-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('✅ Flash sale berhasil dibuat!');
                setShowForm(false);
                setFormData({ name: '', description: '', bannerUrl: '', startTime: '', endTime: '', products: [] });
                fetchFlashSales();
            } else {
                const data = await res.json();
                alert('❌ ' + (data.error || 'Gagal membuat flash sale'));
            }
        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Flash Sale</h1>
                    <p className="text-neutral-500">Kelola event flash sale toko Anda</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="w-4 h-4" />
                    Buat Flash Sale
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">Buat Flash Sale Baru</h2>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Event</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                                placeholder="Flash Sale 12.12"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Waktu Mulai</label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Waktu Selesai</label>
                            <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Banner URL (Opsional)</label>
                            <input
                                type="url"
                                value={formData.bannerUrl}
                                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3 justify-end">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Total Flash Sale</p>
                            <p className="text-2xl font-bold text-neutral-800">{flashSales.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Sedang Aktif</p>
                            <p className="text-2xl font-bold text-green-600">
                                {flashSales.filter(fs => fs.status === 'ACTIVE').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Total Terjual</p>
                            <p className="text-2xl font-bold text-primary-500">
                                {flashSales.reduce((sum, fs) => sum + fs.totalSold, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flash Sales List */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b border-neutral-100">
                    <h2 className="font-semibold text-neutral-800">Daftar Flash Sale</h2>
                </div>
                <div className="divide-y divide-neutral-100">
                    {flashSales.length > 0 ? (
                        flashSales.map((fs) => (
                            <div key={fs.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-neutral-800">{fs.name}</h3>
                                            <Badge variant={statusConfig[fs.status].color}>
                                                {statusConfig[fs.status].label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-neutral-500">
                                            {formatDate(fs.startTime)} - {formatDate(fs.endTime)}
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            {fs.productCount} produk • {fs.totalSold} terjual
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-neutral-500">
                            <Zap className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                            <p>Belum ada flash sale</p>
                            <p className="text-sm">Klik &quot;Buat Flash Sale&quot; untuk membuat event baru</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

