"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import dayjs from "dayjs";
import {
    ArrowLeft,
    Wallet,
    Calendar,
    ChevronRight,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Receipt,
} from "lucide-react";

interface Receivable {
    id: string;
    amount: number;
    paidAmount: number;
    balance: number;
    dueDate: string;
    status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
    createdAt: string;
    order?: { orderNumber: string };
    sale?: { invoiceNumber: string };
}

export default function FinancePage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [receivables, setReceivables] = useState<Receivable[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinance();
    }, [user?.warungId]);

    const fetchFinance = async () => {
        if (!user?.warungId) return;
        setLoading(true);
        try {
            const res = await api.get("/finance/receivables", {
                params: { warungId: user.warungId },
            });
            const data = res.data?.data || res.data || [];
            setReceivables(data);

            const balance = data.reduce((sum: number, r: Receivable) => sum + Number(r.balance), 0);
            setTotalBalance(balance);
        } catch {
            setReceivables([]);
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        UNPAID: { label: "Belum Bayar", color: "text-red-500", bg: "bg-red-50", icon: Clock },
        PARTIAL: { label: "Dibayar Sebagian", color: "text-orange-500", bg: "bg-orange-50", icon: TrendingDown },
        PAID: { label: "Lunas", color: "text-green-500", bg: "bg-green-50", icon: CheckCircle2 },
        OVERDUE: { label: "Jatuh Tempo", color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle },
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header & Total Balance */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-5 pt-6 pb-12 rounded-b-[40px] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white text-lg font-bold">Keuangan</h1>
                        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">BUMAS Ansor</p>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-3">
                        <Wallet className="text-primary" size={24} />
                    </div>
                    <p className="text-white/60 text-xs font-medium">Total Tagihan Belum Lunas</p>
                    <h2 className="text-3xl font-black text-white mt-1">
                        {formatCurrency(totalBalance)}
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto -mt-6 px-5 pb-6 no-scrollbar">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700">Daftar Tagihan</h3>
                        <button
                            onClick={fetchFinance}
                            className="text-[10px] font-bold text-primary uppercase tracking-wider"
                        >
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="animate-spin" size={32} />
                            <p className="mt-4 text-sm font-medium">Memuat data...</p>
                        </div>
                    ) : receivables.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt size={32} className="text-slate-200" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-slate-800">Tidak ada tagihan</p>
                            <p className="text-xs text-slate-400 mt-1">Status keuangan Anda aman.</p>
                        </div>
                    ) : (
                        receivables.map((r) => {
                            const config = statusConfig[r.status] || statusConfig.UNPAID;
                            const Icon = config.icon;
                            const isOverdue = dayjs().isAfter(dayjs(r.dueDate)) && r.status !== "PAID";

                            return (
                                <div key={r.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${config.bg} rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110`} />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
                                                <Icon size={12} strokeWidth={3} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">
                                                    {isOverdue ? "Jatuh Tempo" : config.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {dayjs(r.createdAt).format("DD MMM YYYY")}
                                            </span>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                                    Invoice #{r.order?.orderNumber || r.sale?.invoiceNumber || r.id.slice(0, 8)}
                                                </p>
                                                <h4 className="text-xl font-black text-slate-900 leading-none">
                                                    {formatCurrency(Number(r.balance))}
                                                </h4>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    <p className={`text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                                                        Hingga {dayjs(r.dueDate).format("DD MMM YYYY")}
                                                    </p>
                                                </div>
                                            </div>

                                            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>

                                        {r.status === "PARTIAL" && (
                                            <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-slate-400">Progress</span>
                                                    <span className="text-primary">{Math.round((r.paidAmount / r.amount) * 100)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${(r.paidAmount / r.amount) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
