"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/pos/Header";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import {
    Plus,
    Search,
    Calendar,
    Filter,
    ArrowLeft,
    ChevronRight,
    Loader2,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

interface Debt {
    id: string;
    amount: number;
    paidAmount: number;
    balance: number;
    dueDate: string;
    status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
    customer: {
        name: string;
        phone?: string;
    };
    sale?: {
        invoiceNumber: string;
    };
    createdAt: string;
}

export default function DebtsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchDebts = async () => {
            if (!user?.warungId) return;
            setLoading(true);
            try {
                const res = await api.get("/debts", {
                    params: { warungId: user.warungId },
                });
                setDebts(res.data);
            } catch (err) {
                console.error("Gagal memuat data hutang", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDebts();
    }, [user?.warungId]);

    const filteredDebts = useMemo(() => {
        return debts.filter((d) => {
            const matchesSearch = d.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && d.status !== "PAID") ||
                (statusFilter === "PAID" && d.status === "PAID");
            return matchesSearch && matchesStatus;
        });
    }, [debts, searchQuery, statusFilter]);

    const summary = useMemo(() => {
        return filteredDebts.reduce(
            (acc, curr) => ({
                total: acc.total + Number(curr.balance),
                count: acc.count + 1,
            }),
            { total: 0, count: 0 }
        );
    }, [filteredDebts]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-100 flex items-center gap-3 px-5 py-4">
                <button
                    onClick={() => router.push("/pos")}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Hutang Pelanggan</h1>
            </div>

            {/* Stats Bar */}
            <div className="bg-white px-5 py-4 border-b border-slate-100 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Total Piutang</p>
                    <p className="text-xl font-extrabold text-red-500">
                        {formatCurrency(summary.total)}
                    </p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Transaksi</p>
                    <p className="text-xl font-extrabold text-slate-900">{summary.count}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="p-4 space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama pelanggan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${showFilters ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200"
                            }`}
                    >
                        <Filter size={18} />
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex gap-2 pb-2">
                                {["ALL", "ACTIVE", "PAID"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === s
                                                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                                                : "bg-white text-slate-500 border border-slate-200"
                                            }`}
                                    >
                                        {s === "ALL" ? "Semua" : s === "ACTIVE" ? "Belum Lunas" : "Lunas"}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-sm font-medium">Memuat data piutang...</p>
                    </div>
                ) : filteredDebts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                        <AlertCircle size={48} strokeWidth={1.5} />
                        <p className="mt-4 text-sm font-medium">Tidak ada data hutang</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredDebts.map((debt) => (
                            <motion.button
                                key={debt.id}
                                layout
                                onClick={() => router.push(`/pos/debts/${debt.id}`)}
                                className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 text-left group hover:shadow-md hover:border-primary/20 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${debt.status === "PAID" ? "bg-green-50 text-green-500" :
                                        debt.status === "OVERDUE" ? "bg-red-50 text-red-500" :
                                            "bg-amber-50 text-amber-500"
                                    }`}>
                                    {debt.status === "PAID" ? <CheckCircle2 size={24} /> :
                                        debt.status === "OVERDUE" ? <AlertCircle size={24} /> :
                                            <Clock size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate">{debt.customer.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {dayjs(debt.createdAt).format("DD MMM YYYY")}
                                        </p>
                                        {debt.sale && (
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                {debt.sale.invoiceNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-extrabold text-slate-900">
                                        {formatCurrency(Number(debt.balance))}
                                    </p>
                                    <p className={`text-[10px] font-bold mt-0.5 ${debt.status === "PAID" ? "text-green-500" :
                                            debt.status === "OVERDUE" ? "text-red-500" : "text-amber-500"
                                        }`}>
                                        {debt.status === "PAID" ? "LUNAS" :
                                            debt.status === "OVERDUE" ? "JATUH TEMPO" : "BELUM LUNAS"}
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none">
                <button
                    onClick={() => router.push("/pos/debts/new")}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all pointer-events-auto"
                >
                    <Plus size={20} />
                    Tambah Hutang Baru
                </button>
            </div>
        </div>
    );
}
