"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Box,
    Search,
    Loader2,
    Sparkles,
    AlertTriangle,
    Plus,
    Package,
    Layers
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWarungProducts } from "@/hooks/useWarungProducts";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export default function ProductListPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { data: products, isLoading, error } = useWarungProducts(user?.warungId);

    const [activeTab, setActiveTab] = useState("produk");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((p: any) =>
            p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const tabs = [
        { id: "produk", label: "Produk" },
        { id: "kategori", label: "Kategori" }
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center justify-between px-5 pt-4 pb-2 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800">Produk</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-100 px-5 flex items-center gap-6 sticky top-14 z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 text-sm font-bold relative transition-colors ${activeTab === tab.id ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Search */}
                <div className="px-5 py-4 sticky top-[105px] bg-slate-50 z-0">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border border-slate-200 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 outline-none transition-all shadow-sm font-medium text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
                        <p className="text-sm font-medium">Memuat Produk...</p>
                    </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <div className="px-5 py-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <p className="font-bold text-slate-800 mb-2">Gagal Memuat Produk</p>
                        <p className="text-xs text-slate-500">Pastikan koneksi internet lancar</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
                        <div className="relative w-48 h-48 mb-6 opacity-80">
                            <Image
                                src="/assets/illustrations/empty-box.svg" // Ideally use local asset or fallback 
                                alt="Empty State"
                                width={192}
                                height={192}
                                className="object-contain" // Placeholder image handling needed
                                onError={(e) => {
                                    // Fallback to Icon if image fails
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        parent.innerHTML = '<div class="w-full h-full bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>';
                                    }
                                }}
                            />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Belum Ada Produk</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Pilih &quot;Tambah Produk&quot; untuk menambahkan produk kamu ke dalam inventori.
                        </p>
                        <button
                            onClick={() => router.push("/products/add")}
                            className="mt-6 text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                        >
                            <Plus size={20} />
                            Tambah Produk
                        </button>
                    </div>
                )}

                {/* Product List */}
                {!isLoading && !error && activeTab === "produk" && filteredProducts.length > 0 && (
                    <div className="divide-y divide-slate-100">
                        {filteredProducts.map((item: any) => (
                            <div
                                key={item.id}
                                onClick={() => router.push(`/products/edit/${item.productId}`)}
                                className="flex items-center gap-4 p-5 bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                {/* Product Image / Initial */}
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100 relative shrink-0">
                                    {item.product.image ? (
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-slate-400 font-bold text-lg">
                                            {item.product.name.substring(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate mb-1 group-hover:text-red-500 transition-colors">
                                        {item.product.name}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-600">
                                            Stok: {item.stock}
                                        </span>
                                        <span>•</span>
                                        <span>{item.product.category?.name || "Tanpa Kategori"}</span>
                                    </div>
                                </div>

                                {/* Price & Arrow */}
                                <div className="text-right flex items-center gap-3">
                                    <span className="font-bold text-slate-800">
                                        {formatCurrency(item.price)}
                                    </span>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Category List */}
                {!isLoading && !error && activeTab === "kategori" && (
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: "Kopi", count: 12, color: "bg-red-50 text-red-500" },
                                { name: "Non-Kopi", count: 8, color: "bg-blue-50 text-blue-500" },
                                { name: "Snacks", count: 15, color: "bg-orange-50 text-orange-500" },
                                { name: "Bakery", count: 5, color: "bg-emerald-50 text-emerald-500" },
                                { name: "Merchandise", count: 3, color: "bg-purple-50 text-purple-500" },
                            ].map((cat, idx) => (
                                <button key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left active:scale-[0.98] transition-all group">
                                    <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center mb-4`}>
                                        <Layers size={24} />
                                    </div>
                                    <h4 className="font-black text-slate-800 tracking-tight group-hover:text-red-500">{cat.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{cat.count} Produk</p>
                                </button>
                            ))}
                            <button className="border-2 border-dashed border-slate-200 p-6 rounded-[32px] flex flex-col items-center justify-center text-slate-300 gap-2 active:bg-slate-50">
                                <Plus size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Tambah Kategori</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* FAB Add Button */}
            <div className="fixed bottom-6 right-6 z-20">
                <button
                    onClick={() => router.push("/products/add")}
                    className="w-14 h-14 bg-red-500 rounded-full shadow-xl shadow-red-500/30 flex items-center justify-center text-white hover:bg-red-600 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={32} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
