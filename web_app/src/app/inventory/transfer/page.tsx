"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    MoveHorizontal,
    Plus,
    ChevronRight,
    Loader2,
    ArrowRight
} from "lucide-react";

export default function StockTransferPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [transfers, setTransfers] = useState<any[]>([]);

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
                <button onClick={() => router.back()} className="text-slate-600">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-8">
                    Pemindahan Stok
                </h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                        <p className="mt-4 text-sm font-medium">Memuat data...</p>
                    </div>
                ) : transfers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-32 px-10 text-center">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8">
                            <MoveHorizontal size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Pemindahan</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-[280px]">
                            Pindahkan stok antar outlet kamu dengan mudah dan pantau riwayatnya di sini.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {transfers.map((t) => (
                            <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.transferNumber}</p>
                                    <p className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{t.status}</p>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Dari</p>
                                        <p className="font-bold text-slate-800 truncate">{t.fromOutlet}</p>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-300 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Ke</p>
                                        <p className="font-bold text-slate-800 truncate">{t.toOutlet}</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                                    <p>{t.itemCount} Item</p>
                                    <p>{t.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Button */}
            <div className="p-5 bg-white border-t border-slate-100">
                <button
                    onClick={() => router.push("/inventory/transfer/add")}
                    className="w-full h-14 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                    Pindahkan Stok
                </button>
            </div>
        </div>
    );
}
