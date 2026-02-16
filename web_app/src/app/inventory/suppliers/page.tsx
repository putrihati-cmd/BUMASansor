"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Users,
    Plus,
    Filter,
    ChevronRight,
    Loader2
} from "lucide-react";

export default function SuppliersPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search)
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
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-8">
                        Supplier
                    </h1>
                </div>

                {/* Filter / Search Bar */}
                <div className="px-5 pb-4">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="filter pencarian"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-white rounded-lg border border-slate-200 outline-none text-sm placeholder:text-slate-400 focus:border-red-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-slate-50/20">
                {isLoading && suppliers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                        <p className="mt-4 text-sm font-medium">Memuat data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-32 px-10 text-center">
                        <div className="w-52 h-52 bg-slate-100/50 rounded-full flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 bg-slate-100/30 rounded-full animate-pulse" />
                            <Users size={80} className="text-slate-200 relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Transaksi</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-[280px]">
                            Pilih rentang waktu yang lain atau lakukan transaksi di kasir
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 bg-white">
                        {filtered.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => router.push(`/inventory/suppliers/${s.id}`)}
                                className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4 text-slate-800">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Users size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900">{s.name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{s.phone || '-'}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Button */}
            <div className="p-5 bg-white border-t border-slate-50">
                <button
                    onClick={() => router.push("/inventory/suppliers/add")}
                    className="w-full h-14 bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                    Tambah Supplier
                </button>
            </div>
        </div>
    );
}
