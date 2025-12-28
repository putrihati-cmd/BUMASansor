'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { formatRupiah } from '@/lib/utils';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            params.append('format', 'json');

            const res = await fetch(`/api/admin/reports/sales?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setReportData(data);
            } else {
                alert('Gagal mengambil data laporan');
            }
        } catch (error) {
            console.error('Report error:', error);
            alert('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        params.append('format', 'excel');

        window.open(`/api/admin/reports/sales?${params.toString()}`, '_blank');
    };

    const handleQuickFilter = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        setFilters({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold text-neutral-800">Laporan Penjualan</h1>
                <p className="text-neutral-500">Generate laporan transaksi dan pendapatan</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    Filter Periode
                </h2>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => handleQuickFilter(7)}
                        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-neutral-50"
                    >
                        7 Hari Terakhir
                    </button>
                    <button
                        onClick={() => handleQuickFilter(30)}
                        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-neutral-50"
                    >
                        30 Hari Terakhir
                    </button>
                    <button
                        onClick={() => handleQuickFilter(90)}
                        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-neutral-50"
                    >
                        3 Bulan Terakhir
                    </button>
                    <button
                        onClick={() => setFilters({ startDate: '', endDate: '' })}
                        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-neutral-50 text-neutral-500"
                    >
                        Reset
                    </button>
                </div>

                {/* Custom Date Range */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input
                        type="date"
                        label="Tanggal Mulai"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <Input
                        type="date"
                        label="Tanggal Akhir"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button onClick={fetchReport} disabled={loading}>
                        <FileText className="w-4 h-4" />
                        {loading ? 'Memproses...' : 'Lihat Laporan'}
                    </Button>
                    <Button onClick={downloadExcel} variant="outline">
                        <Download className="w-4 h-4" />
                        Download Excel
                    </Button>
                </div>
            </div>

            {/* Report Summary */}
            {reportData && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Total Pesanan</p>
                                    <p className="text-2xl font-bold text-neutral-800">
                                        {reportData.summary.totalOrders}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Total Pendapatan</p>
                                    <p className="text-2xl font-bold text-neutral-800">
                                        {formatRupiah(reportData.summary.totalRevenue)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Rata-rata Order</p>
                                    <p className="text-2xl font-bold text-neutral-800">
                                        {formatRupiah(reportData.summary.avgOrderValue)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Total Diskon</p>
                                    <p className="text-2xl font-bold text-neutral-800">
                                        {formatRupiah(reportData.summary.totalDiscount)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-neutral-100">
                            <h2 className="font-semibold text-neutral-800">Detail Transaksi</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 border-b border-neutral-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">No Order</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tanggal</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Pelanggan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Items</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {reportData.orders.map((order) => (
                                        <tr key={order.orderNumber} className="hover:bg-neutral-50">
                                            <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                                                {order.orderNumber}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-600">
                                                {new Date(order.date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-600">
                                                {order.customer}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-600 text-right">
                                                {order.items}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-neutral-800 text-right">
                                                {formatRupiah(order.total)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-neutral-100 text-neutral-700'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!reportData && !loading && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Belum Ada Laporan</h3>
                    <p className="text-neutral-500 mb-4">
                        Pilih periode dan klik &quot;Lihat Laporan&quot; untuk generate data
                    </p>
                </div>
            )}
        </div>
    );
}

