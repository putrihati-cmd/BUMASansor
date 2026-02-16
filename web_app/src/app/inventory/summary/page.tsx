"use client";

import {
    Package,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Layers,
    ArrowRightLeft,
    RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function InventorySummaryPage() {
    const router = useRouter();

    const stats = [
        { label: "Total Asset", value: "Rp 45.200.000", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
        { label: "Stok Menipis", value: "12 Produk", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Stok Kosong", value: "3 Produk", icon: Package, color: "text-red-600", bg: "bg-red-50" },
    ];

    const activities = [
        { type: 'IN', label: 'Barang Masuk', qty: '+45', date: 'Hari ini, 14:20', icon: TrendingUp, color: 'text-green-500' },
        { type: 'OUT', label: 'Penyesuaian Keluar', qty: '-2', date: 'Kemarin, 09:15', icon: TrendingDown, color: 'text-red-500' },
        { type: 'TRANS', label: 'Mutasi ke Outlet B', qty: '-10', date: '12 Okt, 11:00', icon: ArrowRightLeft, color: 'text-blue-500' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900">Rangkuman Inventaris</h1>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="flex-1 p-5 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-black text-slate-900 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => router.push('/inventory/adjustment')}
                        className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center space-y-3 group active:bg-slate-50 transition-all"
                    >
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Layers size={21} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Audit Stok</span>
                    </button>
                    <button
                        onClick={() => router.push('/inventory/transfer')}
                        className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center space-y-3 group active:bg-slate-50 transition-all"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowRightLeft size={21} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Mutasi Stok</span>
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Aktivitas Terbaru</h2>
                        <button className="text-red-500 text-xs font-bold">Lihat Semua</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {activities.map((act, idx) => (
                            <div key={idx} className="px-6 py-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-slate-50 ${act.color} flex items-center justify-center shrink-0`}>
                                    <act.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800">{act.label}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{act.date}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black ${act.color}`}>{act.qty}</span>
                                    <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">Pcs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory Alert */}
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-2">
                    <h3 className="text-sm font-bold text-red-800">Tips Optimasi Stok</h3>
                    <p className="text-xs text-red-600 leading-relaxed">
                        Ada <strong>5 produk</strong> yang penjualannya meningkat pesat hari ini. Pastikan stok kamu mencukupi untuk menghindari kerugian.
                    </p>
                </div>
            </div>
        </div>
    );
}
