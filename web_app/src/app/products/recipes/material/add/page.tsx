"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Save,
    Scale,
    Trash2,
    AlertCircle,
    Package
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AddMaterialPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("gram");
    const [cost, setCost] = useState("");
    const [stock, setStock] = useState("");
    const [minStock, setMinStock] = useState("");
    const [isSaving, setIsSaving] = useState(false);

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
                    <h1 className="font-bold text-lg text-slate-800">Tambah Bahan Baku</h1>
                </div>
            </div>

            <div className="flex-1 p-5 space-y-6 pb-32">
                {/* Visual Icon Section */}
                <div className="flex justify-center py-4">
                    <div className="w-24 h-24 bg-white rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                        <Scale size={40} />
                    </div>
                </div>

                {/* Name Field */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <Package size={16} className="text-slate-400" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Dasar</label>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nama Bahan (contoh: Bubuk Cokelat)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all outline-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="h-14 bg-slate-50 border-none rounded-2xl px-5 font-bold text-slate-800 outline-none appearance-none"
                            >
                                <option value="gram">Gram (g)</option>
                                <option value="kg">Kilogram (kg)</option>
                                <option value="ml">Mililiter (ml)</option>
                                <option value="liter">Liter (l)</option>
                                <option value="pcs">Pcs / Biji</option>
                            </select>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                                <input
                                    type="number"
                                    placeholder="Biaya/Satuan"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-5 font-bold text-slate-800 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Section */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <AlertCircle size={16} className="text-slate-400" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok & Inventaris</label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 ml-2 uppercase">Stok Saat Ini</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 ml-2 uppercase">Minimum Stok</label>
                            <input
                                type="number"
                                placeholder="Alert"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-bold text-slate-800 outline-none"
                            />
                        </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50 flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] text-amber-700 leading-relaxed font-medium">BUMAS akan memberi notifikasi saat stok mencapai batas minimum agar operasional tidak terganggu.</p>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 flex gap-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !name || !cost}
                    className="flex-1 h-14 bg-red-600 text-white font-bold rounded-[32px] shadow-lg shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none"
                >
                    {isSaving ? "Menyimpan..." : (
                        <>
                            <Save size={20} />
                            Simpan Bahan Baku
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
