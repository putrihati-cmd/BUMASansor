"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Plus,
    Trash2,
    FlaskConical,
    Package,
    ChevronRight,
    Scale,
    TrendingUp,
    Info
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AddRecipeToProductPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [recipeItems, setRecipeItems] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Mock data
    const availableProducts = [
        { id: '1', name: 'Kopi Kenangan Mantan', price: 18000 },
        { id: '2', name: 'Cappuccino Latte', price: 22000 },
        { id: '3', name: 'Espresso', price: 15000 },
    ];

    const availableMaterials = [
        { id: '101', name: 'Biji Kopi Arabica', unit: 'gram', cost: 250 },
        { id: '102', name: 'Susu UHT', unit: 'ml', cost: 18 },
        { id: '103', name: 'Gula Cair', unit: 'ml', cost: 10 },
    ];

    const addMaterial = (m: any) => {
        if (recipeItems.find(item => item.id === m.id)) return;
        setRecipeItems([...recipeItems, { ...m, amount: 0 }]);
    };

    const updateAmount = (id: string, amount: string) => {
        setRecipeItems(recipeItems.map(item =>
            item.id === id ? { ...item, amount: Number(amount) } : item
        ));
    };

    const removeMaterial = (id: string) => {
        setRecipeItems(recipeItems.filter(item => item.id !== id));
    };

    const totalCost = recipeItems.reduce((acc, item) => acc + (item.cost * item.amount), 0);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            router.back();
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center justify-between px-5 py-4 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800">Buat Resep Produk</h1>
                </div>
            </div>

            <div className="flex-1 p-5 space-y-8 pb-32">
                {/* Product Selector */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Produk</label>
                    {selectedProduct ? (
                        <div className="bg-white p-5 rounded-[32px] border-2 border-red-500 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{selectedProduct.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatCurrency(selectedProduct.price)} / cup</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="text-red-500 text-[10px] font-black uppercase">Ganti</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {availableProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProduct(p)}
                                    className="w-full bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
                                >
                                    <span className="text-sm font-bold text-slate-700">{p.name}</span>
                                    <Plus size={18} className="text-slate-300" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recipe Blueprint */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Komposisi Bahan</label>
                        <span className="text-[9px] font-bold text-slate-300 bg-slate-100 px-3 py-1 rounded-full uppercase">{recipeItems.length} BAHAN</span>
                    </div>

                    <div className="space-y-3">
                        {recipeItems.map((item) => (
                            <div key={item.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                                            <Scale size={16} />
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                    </div>
                                    <button onClick={() => removeMaterial(item.id)} className="text-slate-300 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            placeholder="Gunakan"
                                            value={item.amount || ""}
                                            onChange={(e) => updateAmount(item.id, e.target.value)}
                                            className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 outline-none focus:bg-white"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-[10px] text-slate-400 uppercase">{item.unit}</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-black text-slate-800">{formatCurrency(item.cost * (item.amount || 0))}</p>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-tighter">Modal Bahan</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Material Drawer Trigger Placeholder */}
                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-[32px]">
                            <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Tambahkan Bahan Baku</p>
                            <div className="grid grid-cols-1 gap-2">
                                {availableMaterials.filter(m => !recipeItems.find(ri => ri.id === m.id)).map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => addMaterial(m)}
                                        className="bg-white p-4 rounded-2xl border border-slate-100 text-left flex items-center justify-between active:bg-red-50 transition-colors"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">{m.name}</p>
                                            <p className="text-[9px] text-slate-400 uppercase">{formatCurrency(m.cost)} / {m.unit}</p>
                                        </div>
                                        <Plus size={16} className="text-slate-300" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Economic Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[40px] p-8 text-white space-y-6">
                    <div className="flex justify-between items-center opacity-60">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Harga Jual Produk</span>
                        <span className="font-bold">{selectedProduct ? formatCurrency(selectedProduct.price) : "Rp 0"}</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Estimasi Modal (COGS)</p>
                            <h2 className="text-3xl font-black text-white">{formatCurrency(totalCost)}</h2>
                        </div>
                        {selectedProduct && totalCost > 0 && (
                            <div className="text-right">
                                <p className="text-green-400 text-xs font-bold">Laba {Math.round(((selectedProduct.price - totalCost) / selectedProduct.price) * 100)}%</p>
                                <p className="text-white/40 text-[9px] font-medium">+ {formatCurrency(selectedProduct.price - totalCost)}</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-start gap-3">
                        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-white/60 leading-relaxed italic">Modal dihitung berdasarkan harga beli bahan baku terbaru. Margin keuntungan belum termasuk biaya operasional & listrik.</p>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !selectedProduct || recipeItems.length === 0}
                    className="w-full h-16 bg-red-600 text-white font-black rounded-[32px] shadow-lg shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none"
                >
                    {isSaving ? "Sinkronisasi..." : "Simpan Resep & Kaitkan"}
                </button>
            </div>
        </div>
    );
}
