"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Store,
    Plus,
    ChevronRight,
    MapPin,
    Phone,
    MoreVertical
} from "lucide-react";

export default function OutletsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const outlets = [
        {
            id: 1,
            name: "Pusat",
            type: "Utama",
            phone: "6285119467138",
            address: "Jl. Diponegoro No. 1, Jakarta",
            isActive: true
        }
    ];

    const filtered = outlets.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button onClick={() => router.back()} className="text-slate-600">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-8">
                        Outlet
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="px-5 pb-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari Berdasarkan Nama Outlet"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-medium focus:bg-white focus:border-red-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-5 space-y-4">
                {filtered.map((o) => (
                    <div
                        key={o.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                                        <Store size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-slate-900">{o.name}</h3>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {o.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Phone size={12} />
                                            <p className="text-xs font-medium">{o.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="flex items-start gap-2 text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                                <MapPin size={14} className="mt-0.5 shrink-0" />
                                <p className="text-xs leading-relaxed font-medium">{o.address}</p>
                            </div>
                        </div>

                        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${o.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Aktif</span>
                            </div>
                            <button className="text-xs font-bold text-red-500 flex items-center gap-1">
                                Lihat Detail
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Button */}
            <div className="p-5 bg-white border-t border-slate-100">
                <button
                    onClick={() => router.push("/outlets/add")}
                    className="w-full h-14 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                    Tambah Outlet
                </button>
            </div>
        </div>
    );
}
