"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ClipboardCheck,
    Search,
    Package,
    Loader2,
    AlertCircle,
    CheckCircle2,
    History,
    ChevronRight,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StockOpnamePage() {
    const { user } = useAuthStore();
    const router = useRouter();

    const [products, setProducts] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [actualQty, setActualQty] = useState("");
    const [reason, setReason] = useState("Penyesuaian stok berkala");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (user?.warungId) {
            fetchProducts();
            fetchHistory();
        }
    }, [user?.warungId]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/warungs/${user?.warungId}/products`);
            setProducts(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            // This endpoint might need to be created or adjusted to filter by warungId
            const res = await api.get(`/stocks/history?warungId=${user?.warungId}`);
            setHistory(res.data || []);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleOpname = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setIsProcessing(true);
        setError(null);
        setSuccess(null);

        try {
            await api.post("/stocks/opname", {
                warungId: user?.warungId,
                productId: selectedProduct.productId,
                actualQty: Number(actualQty),
                reason
            });

            setSuccess(`Stok ${selectedProduct.product.name} berhasil disesuaikan.`);
            setSelectedProduct(null);
            setActualQty("");
            fetchProducts();
            fetchHistory();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Gagal melakukan stock opname");
        } finally {
            setIsProcessing(false);
        }
    };

    const filtered = products.filter(p =>
        p.product.name.toLowerCase().includes(search.toLowerCase()) ||
        p.product.barcode?.includes(search)
    );

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-slate-900">Stock Opname</h1>
                        <p className="text-xs text-slate-500">Update stok barang di toko</p>
                    </div>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama barang atau barcode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {success && (
                    <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
                        <p className="text-xs font-semibold text-green-700">{success}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-sm text-slate-400 mt-2">Memuat barang...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((wp) => (
                            <button
                                key={wp.id}
                                onClick={() => {
                                    setSelectedProduct(wp);
                                    setActualQty(String(wp.stockQty));
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="w-full bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Package size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900">{wp.product.name}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Stok Sistem: <span className="text-primary font-bold">{wp.stockQty}</span></p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Opname Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setSelectedProduct(null)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl p-6 flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900">Sesuaikan Stok</h3>
                                <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-100 rounded-full">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{selectedProduct.product.name}</p>
                                    <p className="text-xs text-slate-500">Stok Sistem saat ini: {selectedProduct.stockQty}</p>
                                </div>
                            </div>

                            <form onSubmit={handleOpname} className="space-y-4 pb-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Stok Sebenarnya (Hasil Hitung)</label>
                                    <input
                                        required
                                        type="number"
                                        value={actualQty}
                                        onChange={(e) => setActualQty(e.target.value)}
                                        className="w-full h-14 px-4 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-primary outline-none text-2xl font-extrabold text-center"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Alasan / Catatan</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary outline-none"
                                        placeholder="Contoh: Barang rusak, selisih hitung"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ClipboardCheck size={20} />}
                                    Simpan Perubahan
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
