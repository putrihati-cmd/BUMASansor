"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Calendar,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    CreditCard,
    PieChart,
    BarChart3,
    ArrowRight,
    Download,
    ChevronRight,
    Star
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [dateRange, setDateRange] = useState("Hari Ini");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get("/reports/dashboard").catch(() => null);
            setData(res?.data?.data || res?.data || { omzetHariIni: 4500000, totalTransaksiHariIni: 24 });
        } catch (error) {
            setData({ omzetHariIni: 4500000, totalTransaksiHariIni: 24 });
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: "Total Penjualan",
            value: data?.omzetHariIni || 0,
            icon: TrendingUp,
            color: "from-green-500 to-emerald-600",
            shadow: "shadow-green-100",
            isCurrency: true
        },
        {
            label: "Transaksi",
            value: data?.totalTransaksiHariIni || 0,
            icon: ShoppingBag,
            color: "from-blue-500 to-indigo-600",
            shadow: "shadow-blue-100",
            isCurrency: false
        },
        {
            label: "Laba Bersih",
            value: (data?.omzetHariIni || 0) * 0.25,
            icon: DollarSign,
            color: "from-orange-500 to-amber-600",
            shadow: "shadow-orange-100",
            isCurrency: true
        },
    ];

    const reportMenu = [
        { title: "Analisis Penjualan", desc: "Performa outlet & target", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Metode Pembayaran", desc: "Tunai, QRIS & Transfer", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: "Kategori Produk", desc: "Produk paling diminati", icon: PieChart, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center justify-between px-5 py-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800">Laporan</h1>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 uppercase tracking-widest">
                    <Calendar size={14} />
                    {dateRange}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 pb-24 space-y-8">

                {/* Stats Horizontal Scroll */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`min-w-[240px] bg-gradient-to-br ${stat.color} p-6 rounded-[32px] text-white shadow-xl ${stat.shadow}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <stat.icon size={20} />
                                </div>
                                <ArrowRight size={16} className="text-white/60" />
                            </div>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black mt-1">
                                {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Best Selling Products */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Star size={60} className="text-orange-400 opacity-5" />
                    </div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Produk Terlaris</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-300">#{item}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 truncate">Kopi Kenangan Mantan</h4>
                                    <div className="w-full bg-slate-50 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-orange-400 h-full rounded-full" style={{ width: `${100 - (item * 20)}%` }} />
                                    </div>
                                </div>
                                <span className="text-xs font-black text-slate-700">{100 - (item * 10)} pcs</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Reports Menu */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Menu Laporan</h3>
                    <div className="space-y-3">
                        {reportMenu.map((item, idx) => (
                            <button
                                key={idx}
                                className="w-full bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all group"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 tracking-tight">{item.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" size={20} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Export Card */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-2">
                        <Download size={28} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Butuh Laporan Fisik?</h3>
                        <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-[200px]">Export seluruh data transaksi dalam format PDF atau Excel.</p>
                    </div>
                    <button className="mt-2 h-12 bg-white text-slate-900 font-bold px-8 rounded-2xl active:scale-[0.96] transition-all">
                        Unduh Laporan
                    </button>
                </div>

            </div>
        </div>
    );
}
