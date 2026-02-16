"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    UserPlus,
    Search,
    User,
    Phone,
    CreditCard,
    Loader2,
    ChevronRight,
    Plus
} from "lucide-react";

export default function CustomersPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.warungId) fetchCustomers();
    }, [user?.warungId]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/customers?warungId=${user?.warungId}`);
            setCustomers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch customers", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
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
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-900">Pelanggan</h1>
                    </div>
                    <button
                        className="text-red-500 font-bold text-sm px-2 py-1"
                    >
                        Impor Kontak
                    </button>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari Nama dan No.HP"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-slate-50 rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all text-base"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                {isLoading && customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                        <p className="text-sm text-slate-400 mt-2">Memuat data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-32 px-10 text-center">
                        <div className="w-48 h-48 bg-slate-100 rounded-full flex items-center justify-center mb-6 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-100 opacity-50" />
                            <User size={80} className="text-slate-300 relative z-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Pelanggan</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Silakan tambahkan pelanggan atau impor dari kontak.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map((c) => (
                            <div
                                key={c.id}
                                className="px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4 text-slate-800">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{c.name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{c.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {Number(c.currentDebt) > 0 && (
                                        <p className="text-xs font-bold text-red-500">{formatCurrency(c.currentDebt)}</p>
                                    )}
                                    <ChevronRight size={18} className="text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Button (Only when empty or as a standard action) */}
            <div className="p-5 bg-white border-t border-slate-50">
                <button
                    onClick={() => router.push("/pos/customers/add")}
                    className="w-full h-14 bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                    Tambah Pelanggan
                </button>
            </div>
        </div>
    );
}
