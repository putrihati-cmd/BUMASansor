"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import {
    TrendingUp,
    Wallet,
    AlertTriangle,
    Package,
    ShoppingCart,
    ClipboardList,
    ChevronRight,
    LogOut,
    RefreshCw,
    Loader2,
    BarChart3,
    Store,
} from "lucide-react";

interface DashboardData {
    omzetHariIni: number;
    piutangBelumLunas: number;
    totalTransaksiHariIni: number;
    stokMenipis: number;
    recentSales: {
        id: string;
        invoiceNumber: string;
        totalAmount: number;
        paymentMethod: string;
        createdAt: string;
    }[];
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
            return;
        }
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            // Try to fetch dashboard from reports
            const [dashboardRes, salesRes] = await Promise.all([
                api.get("/reports/dashboard").catch(() => null),
                api
                    .get("/sales", {
                        params: { warungId: user?.warungId, limit: 5 },
                    })
                    .catch(() => null),
            ]);

            const dashData = dashboardRes?.data?.data || dashboardRes?.data;
            const salesData = salesRes?.data?.data || salesRes?.data;

            setData({
                omzetHariIni: dashData?.omzetHariIni ?? dashData?.today?.omzet ?? 0,
                piutangBelumLunas:
                    dashData?.piutangBelumLunas ??
                    dashData?.today?.piutangBelumLunas ??
                    0,
                totalTransaksiHariIni:
                    dashData?.totalTransaksiHariIni ?? 0,
                stokMenipis: dashData?.stokMenipis ?? 0,
                recentSales: Array.isArray(salesData)
                    ? salesData.slice(0, 5)
                    : [],
            });
        } catch {
            setData({
                omzetHariIni: 0,
                piutangBelumLunas: 0,
                totalTransaksiHariIni: 0,
                stokMenipis: 0,
                recentSales: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace("/login");
    };

    const menuItems = [
        {
            icon: ShoppingCart,
            label: "POS Kasir",
            desc: "Buat transaksi penjualan",
            href: "/pos",
            color: "bg-red-500",
        },
        {
            icon: ClipboardList,
            label: "Riwayat Transaksi",
            desc: "Lihat semua penjualan",
            href: "/pos/history",
            color: "bg-orange-500",
        },
        {
            icon: Package,
            label: "Inventaris",
            desc: "Cek stok dan nilai aset",
            href: "/inventory",
            color: "bg-blue-500",
        },
        {
            icon: Wallet,
            label: "Kelola Kas",
            desc: "Buka/Tutup kasir harian",
            href: "/cash-recap",
            color: "bg-emerald-500",
        },
    ];

    const paymentLabel: Record<string, string> = {
        CASH: "Tunai",
        TRANSFER: "Transfer",
        QRIS: "QRIS",
        EDC: "EDC",
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-5 pt-6 pb-12 rounded-b-[40px] relative overflow-hidden shadow-xl shadow-red-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                <div className="flex items-center justify-between relative z-10 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
                            <Store size={24} />
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Outlet Pusat</p>
                            <h1 className="text-white text-lg font-black mt-0.5 leading-none">
                                {user?.name || "Kasir"}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchDashboard}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Omzet Hari Ini</p>
                            <h2 className="text-3xl font-black text-white">
                                {formatCurrency(data?.omzetHariIni || 0)}
                            </h2>
                        </div>
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-green-300 uppercase">Kasir Terbuka</span>
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
                        <div className="text-center border-r border-white/10">
                            <p className="text-[9px] font-bold text-white/50 uppercase">Transaksi</p>
                            <p className="text-sm font-black text-white mt-1">{data?.totalTransaksiHariIni || 0}</p>
                        </div>
                        <div className="text-center border-r border-white/10">
                            <p className="text-[9px] font-bold text-white/50 uppercase">Stok Menipis</p>
                            <p className="text-sm font-black text-white mt-1">{data?.stokMenipis || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-bold text-white/50 uppercase">Pelanggan</p>
                            <p className="text-sm font-black text-white mt-1">12</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto -mt-8 no-scrollbar relative z-20">
                {/* Promo/Feature Banner */}
                <div className="px-5">
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-black text-slate-800">5 Produk Stok Menipis!</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Segera lakukan pembelian stok ke supplier.</p>
                        </div>
                        <button className="text-[10px] font-black text-orange-600 bg-orange-100 px-3 py-1.5 rounded-full uppercase">Cek</button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-5 pt-8">
                    <div className="flex items-center justify-between px-1 mb-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Menu Pintar</h2>
                        <span className="text-[9px] font-bold text-slate-300">OPSI TERSEDIA</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pb-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => router.push(item.href)}
                                    className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 group active:scale-[0.96] transition-all text-left flex flex-col gap-4"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-${item.color.replace('bg-', '')}/20`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 group-hover:text-red-500 transition-colors">
                                            {item.label}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-tight">{item.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="px-5 pt-6 pb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-700">
                            Transaksi Terkini
                        </h2>
                        <button
                            onClick={() => router.push("/pos/history")}
                            className="text-xs text-primary font-semibold"
                        >
                            Lihat Semua
                        </button>
                    </div>

                    {!data?.recentSales || data.recentSales.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                            <Store size={32} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">
                                Belum ada transaksi hari ini
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {data.recentSales.map((sale) => (
                                <button
                                    key={sale.id}
                                    onClick={() => router.push(`/pos/receipt/${sale.id}`)}
                                    className="w-full flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm text-left"
                                >
                                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary/10">
                                        <ClipboardList size={16} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">
                                            {sale.invoiceNumber}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {paymentLabel[sale.paymentMethod] || sale.paymentMethod}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {formatCurrency(Number(sale.totalAmount))}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
