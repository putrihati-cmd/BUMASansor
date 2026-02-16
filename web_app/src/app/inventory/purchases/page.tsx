"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    ShoppingCart,
    Plus,
    Filter,
    ChevronRight,
    Loader2,
    Calendar
} from "lucide-react";

export default function PurchasesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [purchases, setPurchases] = useState<any[]>([]);

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button onClick={() => router.back()} className="text-slate-600">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-8">
                        Pembelian
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="px-5 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nomor invoice / supplier"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-slate-50 rounded-lg border border-slate-100 outline-none text-sm font-medium focus:bg-white focus:border-red-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                        <p className="mt-4 text-sm font-medium">Memuat data...</p>
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-32 px-10 text-center">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8">
                            <ShoppingCart size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Pembelian</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-[280px]">
                            Catat pembelian stok kamu dari supplier untuk melihat riwayatnya di sini.
                        </p>
                    </div>
                ) : (
                    <div className="px-4 space-y-3 pb-24">
                        {purchases.map((p) => (
                            <button
                                key={p.id}
                                className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.99] transition-all"
                            >
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.invoiceNumber}</p>
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        <p className="text-xs font-bold text-slate-600">{p.date}</p>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1">{p.supplierName}</h4>
                                    <p className="text-sm font-bold text-red-500">Rp {p.total.toLocaleString()}</p>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB - Floating Action Button */}
            <button
                onClick={() => router.push("/inventory/purchases/add")}
                className="fixed bottom-6 right-6 w-14 h-14 bg-red-500 text-white rounded-full shadow-xl shadow-red-500/40 flex items-center justify-center active:scale-90 transition-all z-30"
            >
                <Plus size={32} strokeWidth={2.5} />
            </button>
        </div>
    );
}
