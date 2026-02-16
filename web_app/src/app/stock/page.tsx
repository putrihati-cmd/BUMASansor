"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useWarungProducts } from "@/hooks/useWarungProducts";
import { formatCurrency } from "@/lib/utils";
import {
    ArrowLeft,
    Search,
    Package,
    AlertTriangle,
    Loader2,
    Filter,
    Plus,
    ChevronRight,
} from "lucide-react";

export default function StockPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { data: products, isLoading, error } = useWarungProducts(user?.warungId);

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "low">("all");

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((wp: any) => {
            const matchSearch =
                wp.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                wp.product.barcode.toLowerCase().includes(searchQuery.toLowerCase());

            const isLow = wp.stockQty <= (wp.minStock || 5);
            const matchFilter = filter === "all" || (filter === "low" && isLow);

            return matchSearch && matchFilter;
        });
    }, [products, searchQuery, filter]);

    const stats = useMemo(() => {
        if (!products) return { total: 0, low: 0 };
        return {
            total: products.length,
            low: products.filter((wp: any) => wp.stockQty <= (wp.minStock || 5)).length,
        };
    }, [products]);

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-slate-900">Stok Produk</h1>
                        <p className="text-xs text-slate-500">Manajemen Inventaris</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-5 pb-4 space-y-3">
                    <div className="relative group">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Cari nama produk atau barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${filter === "all"
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                                    : "bg-white text-slate-500 border border-slate-100"
                                }`}
                        >
                            Semua ({stats.total})
                        </button>
                        <button
                            onClick={() => setFilter("low")}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${filter === "low"
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    : "bg-white text-slate-500 border border-slate-100"
                                }`}
                        >
                            Stok Menipis ({stats.low})
                            {stats.low > 0 && (
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="animate-spin" size={32} />
                        <p className="mt-4 text-sm font-medium">Memuat stok...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                        <Package size={64} strokeWidth={1} />
                        <p className="mt-4 text-sm font-medium text-slate-400">
                            {searchQuery ? "Produk tidak ditemukan" : "Belum ada stok"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredProducts.map((wp: any) => {
                            const isLow = wp.stockQty <= (wp.minStock || 5);
                            return (
                                <div
                                    key={wp.id}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center gap-4"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLow ? "bg-orange-50 text-orange-500" : "bg-primary/5 text-primary"
                                        }`}>
                                        <Package size={24} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-800 truncate">
                                            {wp.product.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                                            {wp.product.barcode}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                {wp.product.unit || "pcs"}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                                                {formatCurrency(Number(wp.sellingPrice))}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`text-lg font-black ${isLow ? "text-orange-500" : "text-slate-900"
                                            }`}>
                                            {wp.stockQty}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold">STOK</p>
                                        {isLow && (
                                            <div className="flex items-center gap-1 justify-end mt-1 text-orange-500">
                                                <AlertTriangle size={10} />
                                                <span className="text-[10px] font-bold">Restock</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Action */}
            <div className="p-5">
                <button
                    onClick={() => router.push("/pos")}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                >
                    <div className="p-1.5 bg-primary rounded-lg">
                        <Plus size={16} />
                    </div>
                    Buka POS Kasir
                </button>
            </div>
        </div>
    );
}
