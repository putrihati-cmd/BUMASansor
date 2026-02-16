"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Puzzle,
    ChevronRight,
    Search,
    ShieldCheck,
    Zap,
    ExternalLink
} from "lucide-react";

export default function IntegrationsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const integrationCategories = [
        {
            title: "Pembayaran Digital",
            items: [
                { name: "QRIS Dinamis", provider: "BUMAS Pay", status: "TERPASANG", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
                { name: "Transfer Bank", provider: "Virtual Account", status: "AKTIF", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
            ]
        },
        {
            title: "Layanan Pesan Antar",
            items: [
                { name: "GrabFood", provider: "Grab", status: "HUBUNGKAN", icon: Puzzle, color: "text-emerald-600", bg: "bg-emerald-50" },
                { name: "GoFood", provider: "Gojek", status: "HUBUNGKAN", icon: Puzzle, color: "text-red-500", bg: "bg-red-50" },
            ]
        },
        {
            title: "Akuntansi & Keuangan",
            items: [
                { name: "Jurnal.id", provider: "Mekari", status: "HUBUNGKAN", icon: ExternalLink, color: "text-indigo-500", bg: "bg-indigo-50" },
            ]
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800 flex-1 text-center pr-8">Integrasi</h1>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari integrasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm focus:border-red-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-5 pb-10">
                {/* Banner */}
                <div className="bg-indigo-600 rounded-3xl p-6 text-white mb-8 shadow-lg shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Puzzle size={120} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">Perluas Jangkauan Bisnis</h2>
                        <p className="text-indigo-100 text-xs leading-relaxed opacity-80 max-w-[240px]">
                            Hubungkan BUMAS dengan platform favoritmu untuk otomatisasi yang lebih baik.
                        </p>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-8">
                    {integrationCategories.map((cat, idx) => (
                        <div key={idx} className="space-y-4">
                            <h3 className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.title}</h3>
                            <div className="space-y-3">
                                {cat.items.map((item, iidx) => (
                                    <button
                                        key={iidx}
                                        className="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                                                <item.icon size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium">oleh {item.provider}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-bold px-3 py-1 rounded-full ${item.status === 'HUBUNGKAN' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                                                {item.status}
                                            </span>
                                            <ChevronRight className="text-slate-300 group-hover:text-red-500" size={18} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
