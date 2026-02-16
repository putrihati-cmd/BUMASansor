"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Plus,
    FlaskConical,
    Coffee,
    Scale,
    ChevronRight,
    Filter,
    ArrowUpDown
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function RecipesPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"MATERIAL" | "RECIPE">("MATERIAL");
    const [search, setSearch] = useState("");

    // Mock data for materials
    const materials = [
        { id: '1', name: 'Biji Kopi Arabica', stock: 5000, unit: 'gram', cost: 250 },
        { id: '2', name: 'Gula Pasir', stock: 2000, unit: 'gram', cost: 15 },
        { id: '3', name: 'Susu UHT', stock: 12, unit: 'liter', cost: 18000 },
    ];

    // Mock data for recipes
    const recipes = [
        { id: '1', productName: 'Kopi Kenangan Mantan', materialCount: 3, costPerProduct: 5500 },
        { id: '2', productName: 'Cappuccino Latte', materialCount: 2, costPerProduct: 7200 },
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
                    <h1 className="font-bold text-lg text-slate-800 flex-1 text-center pr-8">Bahan Baku & Resep</h1>
                </div>

                {/* Tabs */}
                <div className="flex px-5 pb-3 gap-6">
                    <button
                        onClick={() => setTab("MATERIAL")}
                        className={`text-sm font-black transition-all relative pb-2 ${tab === "MATERIAL" ? 'text-red-600' : 'text-slate-400'}`}
                    >
                        Bahan Baku
                        {tab === "MATERIAL" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setTab("RECIPE")}
                        className={`text-sm font-black transition-all relative pb-2 ${tab === "RECIPE" ? 'text-red-600' : 'text-slate-400'}`}
                    >
                        Resep
                        {tab === "RECIPE" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />}
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={tab === "MATERIAL" ? "Cari bahan baku..." : "Cari resep produk..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm focus:border-red-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 p-5 space-y-4">
                {tab === "MATERIAL" ? (
                    <div className="space-y-3">
                        {materials.map((m) => (
                            <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group active:bg-slate-50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <Scale size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">{m.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Stok: {m.stock} {m.unit}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-800">{formatCurrency(m.cost)}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">biaya / {m.unit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recipes.map((r) => (
                            <button
                                key={r.id}
                                className="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <FlaskConical size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">{r.productName}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{r.materialCount} Bahan Baku</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-800">{formatCurrency(r.costPerProduct)}</p>
                                        <p className="text-[9px] text-slate-400 font-medium tracking-tight">modal per item</p>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" size={20} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB Add */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                <button
                    onClick={() => router.push(tab === "MATERIAL" ? "/products/recipes/material/add" : "/products/recipes/add-to-product")}
                    className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center active:scale-95 transition-all"
                >
                    <Plus size={28} />
                </button>
            </div>
        </div>
    );
}
