"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Image as ImageIcon,
    Plus,
    Minus,
    Trash2,
    Search,
    Package,
    Tag,
    X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AddBundlePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Mock items to select
    const availableProducts = [
        { id: '1', name: 'Kopi Kenangan Mantan', price: 18000 },
        { id: '2', name: 'Donut Cokelat', price: 12000 },
        { id: '3', name: 'Roti Bakar', price: 15000 },
    ];

    const addItem = (product: any) => {
        const existing = selectedItems.find(i => i.id === product.id);
        if (existing) {
            setSelectedItems(selectedItems.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setSelectedItems([...selectedItems, { ...product, qty: 1 }]);
        }
    };

    const updateQty = (id: string, delta: number) => {
        setSelectedItems(selectedItems.map(i => {
            if (i.id === id) {
                const n = Math.max(1, i.qty + delta);
                return { ...i, qty: n };
            }
            return i;
        }));
    };

    const removeItem = (id: string) => {
        setSelectedItems(selectedItems.filter(i => i.id !== id));
    };

    const totalOriginal = selectedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

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
            <div className="bg-white border-b border-slate-100 flex items-center gap-4 px-5 py-4 sticky top-0 z-20">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-lg text-slate-800 flex-1">Buat Bundel Baru</h1>
            </div>

            <div className="flex-1 p-5 pb-32 space-y-6">
                {/* Photo Placeholder */}
                <div className="flex justify-center">
                    <div className="w-32 h-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 active:bg-slate-50 transition-colors cursor-pointer">
                        <ImageIcon size={32} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tambah Foto</span>
                    </div>
                </div>

                {/* Bundle Info */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Nama Bundel</label>
                        <input
                            type="text"
                            placeholder="Contoh: Paket Hemat Sarapan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-12 bg-white rounded-2xl px-5 border border-slate-100 outline-none focus:border-red-400 shadow-sm font-bold text-slate-800"
                        />
                    </div>
                </div>

                {/* Items in Bundle */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pl-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Produk dalam Bundel</label>
                        <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{selectedItems.length} PRODUK</span>
                    </div>

                    <div className="space-y-3">
                        {selectedItems.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Package size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">{formatCurrency(item.price)} / pcs</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-slate-50 rounded-xl p-1">
                                        <button
                                            onClick={() => updateQty(item.id, -1)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-500 active:text-red-500"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-6 text-center text-xs font-black text-slate-700">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.id, 1)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-500 active:text-red-500"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="w-10 h-10 flex items-center justify-center text-red-300 hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Selector Trigger */}
                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-3xl">
                            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 text-center">Pilih Produk Konten</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {availableProducts.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => addItem(p)}
                                        className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-left flex items-center justify-between group active:bg-red-50"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">{p.name}</p>
                                            <p className="text-[9px] text-slate-400">{formatCurrency(p.price)}</p>
                                        </div>
                                        <Plus size={14} className="text-slate-300 group-hover:text-red-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white space-y-4">
                    <div className="flex justify-between items-center opacity-60">
                        <span className="text-xs font-bold uppercase tracking-widest">Total Harga Normal</span>
                        <span className="font-bold">{formatCurrency(totalOriginal)}</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">Harga Bundel (Diskon)</label>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-white">Rp</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="flex-1 bg-white/10 rounded-2xl h-14 px-5 text-xl font-black text-white outline-none focus:bg-white/20 transition-all"
                            />
                        </div>
                    </div>
                    {totalOriginal > Number(price) && Number(price) > 0 && (
                        <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-xl text-[10px] font-bold">
                            <Tag size={12} />
                            HEMAT {formatCurrency(totalOriginal - Number(price))} ({Math.round(((totalOriginal - Number(price)) / totalOriginal) * 100)}%)
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 flex gap-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !name || selectedItems.length === 0}
                    className="flex-1 h-14 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300"
                >
                    {isSaving ? "Menyimpan..." : "Simpan Bundel"}
                </button>
            </div>
        </div>
    );
}
