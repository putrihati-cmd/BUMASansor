'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    DollarSign,
    Package,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    AlertCircle,
    AlertTriangle
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statusColors = {
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
    PAID: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-cyan-100 text-cyan-700',
    DELIVERED: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-red-100 text-red-700',
};

const statusLabels = {
    PENDING_PAYMENT: 'Menunggu Bayar',
    PAID: 'Dibayar',
    PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim',
    DELIVERED: 'Diterima',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REFUNDED: 'Dikembalikan',
};

const iconMap = {
    'Total Pendapatan': DollarSign,
    'Total Pesanan': ShoppingBag,
    'Pelanggan Baru': Users,
    'Produk Terjual': Package,
};

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        stats: [],
        statusCounts: {},
        recentOrders: [],
    });
    const [chartData, setChartData] = useState([]);
    const [visitorStats, setVisitorStats] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch('/api/admin/stats', {
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Gagal mengambil data');
            }

            const result = await res.json();
            setData(result);
        } catch (err) {
            setError(err.message);
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        try {
            const res = await fetch('/api/admin/analytics/sales-chart?days=7');
            if (res.ok) {
                const result = await res.json();
                setChartData(result.chartData || []);
            }
        } catch (err) {
            console.error('Chart data error:', err);
        }
    };

    const fetchVisitorStats = async () => {
        try {
            const res = await fetch('/api/admin/analytics/visitors');
            if (res.ok) {
                const result = await res.json();
                setVisitorStats(result.stats);
            }
        } catch (err) {
            console.error('Visitor stats error:', err);
        }
    };

    useEffect(() => {
        // Parallel fetch to reduce lag
        Promise.all([
            fetchData(),
            fetchChartData(),
            fetchVisitorStats()
        ]);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    const { stats, statusCounts, recentOrders } = data;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Dashboard</h1>
                    <p className="text-neutral-500">Selamat datang kembali! Berikut ringkasan toko Anda.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Refresh data"
                >
                    <RefreshCw className="w-5 h-5 text-neutral-600" />
                </button>
            </div>

            {/* Low Stock Alert */}
            {statusCounts.lowStock > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Perhatian: Stok Menipis</h3>
                            <p className="text-sm text-amber-700">
                                Terdapat <strong>{statusCounts.lowStock} produk</strong> yang stoknya di bawah batas aman. Segera lakukan restock.
                            </p>
                        </div>
                    </div>
                    <Link href="/admin/products" className="px-4 py-2 bg-white border border-amber-200 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors text-sm">
                        Cek Produk
                    </Link>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = iconMap[stat.label] || TrendingUp;
                    return (
                        <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-neutral-800">
                                        {stat.format === 'currency'
                                            ? formatRupiah(stat.value)
                                            : stat.value.toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.change >= 0 ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    <Icon className={`w-5 h-5 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`} />
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 mt-3 text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.change >= 0 ? (
                                    <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4" />
                                )}
                                <span>{Math.abs(stat.change)}% dari bulan lalu</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sales Chart */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-semibold text-neutral-800 mb-4">Trend Penjualan (7 Hari Terakhir)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dateLabel" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                formatter={(value, name) => {
                                    if (name === 'sales') return [formatRupiah(value), 'Penjualan'];
                                    return [value, 'Pesanan'];
                                }}
                            />
                            <Legend
                                formatter={(value) => {
                                    if (value === 'sales') return 'Penjualan (Rp)';
                                    return 'Jumlah Pesanan';
                                }}
                            />
                            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="sales" />
                            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="orders" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="font-semibold text-neutral-800">Pesanan Terbaru</h2>
                        <Link href="/admin/orders" className="text-sm text-primary-500 hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/admin/orders/${order.id}`} className="font-medium text-neutral-800 hover:text-primary-500">
                                                {order.id}
                                            </Link>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                                            <span>{order.customer}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {order.date}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-neutral-800">{formatRupiah(order.total)}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-neutral-500">
                                Belum ada pesanan
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Summary */}
                <div className="space-y-6">
                    {/* Visitor Stats */}
                    {visitorStats && (
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h2 className="font-semibold text-neutral-800 mb-4">👥 Statistik Pengunjung</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-500">Hari Ini</span>
                                    <span className="font-semibold text-neutral-800">{visitorStats.today.visitors}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-500">Minggu Ini</span>
                                    <span className="font-semibold text-neutral-800">{visitorStats.week.visitors}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-500">Bulan Ini</span>
                                    <span className="font-semibold text-neutral-800">{visitorStats.month.visitors}</span>
                                </div>
                                <div className="pt-3 border-t border-neutral-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500">Total Users</span>
                                        <span className="font-bold text-primary-500">{visitorStats.total.users}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h2 className="font-semibold text-neutral-800 mb-4">Aksi Cepat</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/admin/products/new" className="p-3 bg-primary-50 rounded-lg text-center hover:bg-primary-100 transition-colors">
                                <Package className="w-6 h-6 text-primary-500 mx-auto mb-1" />
                                <span className="text-sm font-medium text-primary-700">Tambah Produk</span>
                            </Link>
                            <Link href="/admin/vouchers/new" className="p-3 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                <span className="text-sm font-medium text-green-700">Buat Voucher</span>
                            </Link>
                        </div>
                    </div>

                    {/* Order Status Summary */}
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h2 className="font-semibold text-neutral-800 mb-4">Status Pesanan</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600">Menunggu Bayar</span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                    {statusCounts.pendingPayment || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600">Perlu Diproses</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {statusCounts.needProcess || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600">Sedang Dikirim</span>
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    {statusCounts.shipping || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600">Refund Pending</span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                    {statusCounts.pendingRefunds || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

