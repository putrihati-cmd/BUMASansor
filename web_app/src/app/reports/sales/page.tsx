"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    TrendingUp,
    Layers,
    ShoppingCart,
    Clock
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SalesAnalysisPage() {
    const router = useRouter();

    const performanceData = [
        { label: 'Penjualan Bersih', value: 12450000, trend: '+12.5%', isPositive: true },
        { label: 'Rata-rata Transaksi', value: 45000, trend: '-2.1%', isPositive: false },
        { label: 'Item Terjual', value: 245, trend: '+8.0%', isPositive: true },
    ];

    const hourlySales = [
        { time: '08:00', amount: 450000 },
        { time: '10:00', amount: 1200000 },
        { time: '12:00', amount: 2400000 },
        { time: '15:00', amount: 1800000 },
        { time: '19:00', amount: 3200000 },
        { time: '21:00', amount: 1200000 },
    ];

    const topCategories = [
        { name: 'Minuman Kopi', percentage: 45, color: 'bg-red-500' },
        { name: 'Snack & Roti', percentage: 30, color: 'bg-orange-500' },
        { name: 'Non-Kopi', percentage: 15, color: 'bg-blue-500' },
        { name: 'Lainnya', percentage: 10, color: 'bg-slate-300' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center justify-between px-5 py-4 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800">Analisis Penjualan</h1>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <Calendar size={18} />
                </button>
            </div>

            <div className="flex-1 p-5 space-y-8 pb-10">
                {/* Performance Cards */}
                <div className="grid grid-cols-1 gap-4">
                    {performanceData.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-xl font-black text-slate-800">
                                    {typeof stat.value === 'number' && stat.label.includes('Penjualan') || stat.label.includes('Rata-rata') ? formatCurrency(stat.value) : stat.value}
                                </h3>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.trend}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sales Chart Visualization Placeholder */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">Tren Per Jam</h4>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 tracking-widest border border-slate-100 px-3 py-1 rounded-full uppercase">Realtime</span>
                    </div>

                    <div className="h-40 flex items-end gap-3 justify-between">
                        {hourlySales.map((h, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="w-full relative">
                                    <div
                                        className="w-full bg-slate-50 rounded-full flex items-end justify-center overflow-hidden h-32"
                                    >
                                        <div
                                            className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-full group-hover:from-red-700 group-hover:to-red-500 transition-all duration-700"
                                            style={{ height: `${(h.amount / 3200000) * 100}%` }}
                                        />
                                    </div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[8px] font-bold px-2 py-1 rounded">
                                        {formatCurrency(h.amount)}
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">{h.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                            <Layers size={20} />
                        </div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">Performa Kategori</h4>
                    </div>

                    <div className="flex h-3 w-full rounded-full overflow-hidden">
                        {topCategories.map((cat, idx) => (
                            <div
                                key={idx}
                                className={`${cat.color} h-full`}
                                style={{ width: `${cat.percentage}%` }}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        {topCategories.map((cat, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-slate-800 truncate">{cat.name}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{cat.percentage}% Volume</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Box */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                        <Clock size={32} className="text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black tracking-tight leading-tight">Waktu Paling Sibuk</h4>
                        <p className="text-xs text-white/50 mt-1">12:00 - 14:00 & 19:00 - 21:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
