"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Loader2,
    Save,
    Plus,
    Minus,
    AlertCircle,
    Package
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWarungProducts } from "@/hooks/useWarungProducts";
import Image from "next/image";

export default function StockAdjustmentPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { data: products, isLoading } = useWarungProducts(user?.warungId);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [adjustmentReason, setAdjustmentReason] = useState("Kerusakan");
    const [adjustmentType, setAdjustmentType] = useState<"in" | "out">("out");
    const [adjustmentAmount, setAdjustmentAmount] = useState(1);
    const [notes, setNotes] = useState("");

    const reasons = [
        "Kerusakan",
        "Hilang",
        "Koreksi Kesalahan",
        "Retur Supplier",
        "Kebutuhan Internal",
        "Kadaluarsa"
    ];

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((p: any) =>
            p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const handleSave = () => {
        // Logic to save adjustment
        console.log("Saving adjustment:", {
            product: selectedProduct,
            type: adjustmentType,
            amount: adjustmentAmount,
            reason: adjustmentReason,
            notes: notes
        });
        setSelectedProduct(null);
        setAdjustmentAmount(1);
        setNotes("");
    };

    if (selectedProduct) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <div className="bg-white border-b border-slate-100 flex items-center gap-3 px-5 py-4 sticky top-0 z-20">
                    <button onClick={() => setSelectedProduct(null)} className="p-2 -ml-2 text-slate-600">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="font-bold text-xl text-slate-800">Detail Penyesuaian</h1>
                </div>

                <div className="flex-1 p-5 space-y-6">
                    {/* Product Card */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                            {selectedProduct.product.image ? (
                                <Image src={selectedProduct.product.image} alt={selectedProduct.product.name} fill className="object-cover" />
                            ) : (
                                <Package className="text-slate-300" size={32} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800">{selectedProduct.product.name}</h3>
                            <p className="text-sm text-slate-400">Stok Saat Ini: <span className="font-bold text-slate-600">{selectedProduct.stock}</span></p>
                        </div>
                    </div>

                    {/* Adjustment Controls */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setAdjustmentType("out")}
                                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg font-bold transition-all ${adjustmentType === "out" ? "bg-red-500 text-white shadow-md shadow-red-200" : "text-slate-500"}`}
                            >
                                <Minus size={18} /> Stok Keluar
                            </button>
                            <button
                                onClick={() => setAdjustmentType("in")}
                                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg font-bold transition-all ${adjustmentType === "in" ? "bg-green-500 text-white shadow-md shadow-green-200" : "text-slate-500"}`}
                            >
                                <Plus size={18} /> Stok Masuk
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Jumlah Penyesuaian</p>
                            <div className="flex items-center justify-center gap-8">
                                <button
                                    onClick={() => setAdjustmentAmount(Math.max(1, adjustmentAmount - 1))}
                                    className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-50"
                                >
                                    <Minus size={24} />
                                </button>
                                <span className="text-5xl font-black text-slate-800 tabular-nums">
                                    {adjustmentAmount}
                                </span>
                                <button
                                    onClick={() => setAdjustmentAmount(adjustmentAmount + 1)}
                                    className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-50"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Alasan Penyesuaian</p>
                            <div className="flex flex-wrap gap-2">
                                {reasons.map(reason => (
                                    <button
                                        key={reason}
                                        onClick={() => setAdjustmentReason(reason)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${adjustmentReason === reason ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-100 text-slate-500'}`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Catatan (Opsional)</p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tulis catatan di sini..."
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium outline-none focus:border-red-200 transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-white border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        className="w-full h-14 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        Simpan Penyesuaian
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <div className="bg-white border-b border-slate-50">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button onClick={() => router.back()} className="text-slate-600">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 text-center flex-1 pr-8">
                        Pilih Produk
                    </h1>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari produk berdasarkan nama / barcode"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-medium focus:bg-white focus:border-red-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
                        <p className="text-sm font-medium">Memuat Produk...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-32 px-10 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Package size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h3>
                        <p className="text-sm text-slate-400">Pastikan kata kunci pencarian sudah benar</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filteredProducts.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedProduct(item)}
                                className="w-full p-5 flex items-center gap-4 hover:bg-slate-50/50 active:bg-slate-50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 relative overflow-hidden">
                                    {item.product.image ? (
                                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                    ) : (
                                        <Package className="text-slate-300" size={24} />
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate mb-1">{item.product.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs text-slate-400">Stok: <span className="font-bold text-slate-600">{item.stock}</span></p>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <p className="text-xs text-slate-400 truncate">{item.product.barcode || 'Tanpa Barcode'}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Hint */}
            <div className="p-4 bg-orange-50/50 flex gap-3">
                <AlertCircle className="text-orange-400 shrink-0" size={18} />
                <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
                    Gunakan fitur ini untuk menyesuaikan stok fisik dengan stok sistem jika terjadi kerusakan, kehilangan, atau kesalahan input.
                </p>
            </div>
        </div>
    );
}
