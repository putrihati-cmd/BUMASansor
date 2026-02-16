"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import dayjs from "dayjs";
import {
    ArrowLeft,
    Calendar,
    ChevronRight,
    Loader2,
    Receipt,
    TrendingUp,
    Search,
    Filter,
} from "lucide-react";

export default function HistoryPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState("transaksi");
    const [search, setSearch] = useState("");
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(dayjs().format("YYYY-MM-DD"));

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.warungId) return;
            setLoading(true);
            try {
                const res = await api.get("/sales", {
                    params: { warungId: user.warungId, date: dateFilter },
                });
                const data = res.data?.data || res.data || [];
                setSales(Array.isArray(data) ? data : []);
            } catch {
                setSales([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.warungId, dateFilter]);

    const filteredSales = sales.filter(s =>
        s.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="bg-white">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button
                        onClick={() => router.back()}
                        className="text-slate-600"
                    >
                        <ArrowLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-8">
                        Riwayat Transaksi
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab("transaksi")}
                        className={`flex-1 py-3 text-sm font-bold transition-all relative ${activeTab === "transaksi" ? "text-red-500" : "text-slate-400"}`}
                    >
                        Transaksi
                        {activeTab === "transaksi" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("kasbon")}
                        className={`flex-1 py-3 text-sm font-bold transition-all relative ${activeTab === "kasbon" ? "text-red-500" : "text-slate-400"}`}
                    >
                        Kasbon
                        {activeTab === "kasbon" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="p-5 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nomor struk"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-lg border border-slate-200 outline-none text-sm focus:border-red-500"
                        />
                    </div>
                    <button className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Date Picker Section */}
                <div className="px-5 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Calendar size={18} className="text-slate-400" />
                        <span>{dayjs(dateFilter).format("DD/MM/YYYY")} - {dayjs(dateFilter).format("DD/MM/YYYY")}</span>
                    </div>
                    <button className="text-red-500 font-bold text-sm">UBAH</button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/30">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                        <p className="mt-4 text-sm font-medium">Memuat data...</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-10 text-center">
                        <div className="w-48 h-48 bg-slate-100 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-100 opacity-50" />
                            <Receipt size={80} className="text-slate-300 relative z-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Transaksi</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {activeTab === "transaksi"
                                ? "Pilih rentang waktu yang lain atau lakukan transaksi di kasir"
                                : "Tidak ada data riwayat kasbon pada rentang waktu ini."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 bg-white">
                        {filteredSales.map((sale) => (
                            <button
                                key={sale.id}
                                onClick={() => router.push(`/pos/receipt/${sale.id}`)}
                                className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">{sale.invoiceNumber}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {dayjs(sale.createdAt).format("HH:mm")} • {sale.paymentMethod}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div>
                                        <p className="font-bold text-slate-900">{formatCurrency(sale.totalAmount)}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">LUNAS</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* PRO History Banner */}
            <div className="p-4 bg-white border-t border-slate-50">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                            <TrendingUp size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-800 uppercase tracking-tighter">Lihat Riwayat Lebih Lama</p>
                            <p className="text-[10px] text-red-600">Berlangganan fitur Pro sekarang!</p>
                        </div>
                    </div>
                    <button className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">PRO</button>
                </div>
            </div>
        </div>
    );
}
