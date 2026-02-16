"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Loader2,
    Save,
    RotateCcw,
    Minus,
    Plus
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWarungProducts } from "@/hooks/useWarungProducts";
import Image from "next/image";

export default function StockManagementPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { data: products, isLoading } = useWarungProducts(user?.warungId);

    const [searchQuery, setSearchQuery] = useState("");
    const [changedStocks, setChangedStocks] = useState<Record<string, number>>({});

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((p: any) =>
            p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const handleStockChange = (productId: string, change: number) => {
        setChangedStocks(prev => {
            const currentChange = prev[productId] || 0;
            return { ...prev, [productId]: currentChange + change };
        });
    };

    const getNewStock = (item: any) => {
        const change = changedStocks[item.productId] || 0;
        return item.stock + change;
    };

    const hasChanges = Object.keys(changedStocks).length > 0;

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center justify-between px-5 py-4 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800 leading-tight">Atur Stok</h1>
                        <p className="text-xs text-slate-400">Update stok on-hand</p>
                    </div>
                </div>
                {hasChanges && (
                    <button
                        onClick={() => setChangedStocks({})}
                        className="text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="px-5 py-4 bg-white border-b border-slate-100 sticky top-[73px] z-10">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                        <p className="text-sm font-medium">Memuat Data Stok...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredProducts.map((item: any) => {
                            const newStock = getNewStock(item);
                            const isChanged = changedStocks[item.productId] !== undefined;

                            return (
                                <div key={item.id} className={`flex items-center gap-4 p-5 bg-white ${isChanged ? 'bg-blue-50/30' : ''}`}>
                                    {/* Product Image */}
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

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate mb-1 text-sm">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Stok Awal: <span className="font-medium text-slate-600">{item.stock}</span>
                                        </p>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => handleStockChange(item.productId, -1)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors border-r border-slate-200"
                                            disabled={newStock <= 0}
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <div className="w-12 h-10 flex items-center justify-center bg-white font-bold text-slate-800 tabular-nums">
                                            {newStock}
                                        </div>
                                        <button
                                            onClick={() => handleStockChange(item.productId, 1)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-green-50 hover:text-green-500 active:bg-green-100 transition-colors border-l border-slate-200"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Action */}
            <div className={`fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 transform transition-transform duration-300 ${hasChanges ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500">
                        <span className="font-bold text-slate-800">{Object.keys(changedStocks).length}</span> produk diubah
                    </p>
                </div>
                <button
                    onClick={() => console.log('Save stocks', changedStocks)}
                    className="w-full h-14 bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    Simpan Perubahan
                </button>
            </div>
        </div>
    );
}
