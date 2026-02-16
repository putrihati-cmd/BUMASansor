"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Plus,
    Package,
    ShoppingBag,
    ChevronRight,
    Tag,
    Layers
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BundlesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");

    // Mock data for bundles
    const bundles = [
        {
            id: '1',
            name: 'Paket Sarapan Hemat',
            itemsCount: 2,
            price: 25000,
            originalPrice: 30000,
            stock: 20,
            isActive: true
        },
        {
            id: '2',
            name: 'Bundle Kopi & Donut',
            itemsCount: 3,
            price: 45000,
            originalPrice: 55000,
            stock: 15,
            isActive: true
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
                    <h1 className="font-bold text-lg text-slate-800 flex-1 text-center pr-8">Bundel Produk</h1>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari bundel..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm focus:border-red-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 p-5 space-y-4">
                {bundles.length > 0 ? (
                    <div className="space-y-3">
                        {bundles.map((bundle) => (
                            <button
                                key={bundle.id}
                                onClick={() => router.push(`/products/bundles/${bundle.id}`)}
                                className="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-all group"
                            >
                                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                    <Layers size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 truncate">{bundle.name}</h3>
                                        {!bundle.isActive && (
                                            <span className="bg-slate-100 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded">NONAKTIF</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        <span>{bundle.itemsCount} Produk</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span>Stok: {bundle.stock}</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm font-black text-red-600">{formatCurrency(bundle.price)}</span>
                                        <span className="text-[10px] text-slate-300 line-through font-bold">{formatCurrency(bundle.originalPrice)}</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" size={20} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-white rounded-full border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                            <Layers size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Belum Ada Bundel</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-[240px]">
                            Tarik perhatian pelanggan dengan menggabungkan beberapa produk dalam satu paket diskon.
                        </p>
                    </div>
                )}
            </div>

            {/* FAB Add */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={() => router.push("/products/bundles/add")}
                    className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center active:scale-95 transition-all"
                >
                    <Plus size={28} />
                </button>
            </div>
        </div>
    );
}
