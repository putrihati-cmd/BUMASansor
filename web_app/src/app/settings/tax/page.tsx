"use client";

import { useState } from "react";
import { ArrowLeft, Save, Info, Percent, DollarSign, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function TaxSettingsPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Mock initial settings
    const [taxes, setTaxes] = useState([
        { id: '1', name: 'PB1 / Pajak Restoran', value: 10, type: 'PERCENT', isActive: true },
        { id: '2', name: 'Service Charge', value: 5, type: 'PERCENT', isActive: false },
    ]);

    const handleToggle = (id: string) => {
        setTaxes(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    };

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
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900">Pajak & Biaya</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 disabled:opacity-50"
                >
                    <Save size={18} />
                </button>
            </div>

            <div className="flex-1 p-5 space-y-6">
                {/* Info Card */}
                <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Info size={16} />
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Pajak yang aktif akan otomatis muncul di halaman checkout. Kamu bisa memilih untuk menampilkan pajak di dalam harga produk (Tax Inclusive) atau menambahkannya di akhir transaksi (Tax Exclusive).
                    </p>
                </div>

                {/* Tax List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daftar Pajak & Biaya</h2>
                        <button className="text-red-500 font-bold text-xs flex items-center gap-1">
                            <Plus size={14} /> Tambah Baru
                        </button>
                    </div>

                    <div className="space-y-3">
                        {taxes.map((tax) => (
                            <div
                                key={tax.id}
                                className={`bg-white p-5 rounded-3xl border transition-all ${tax.isActive ? 'border-red-100 shadow-sm' : 'border-slate-100 opacity-60'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tax.isActive ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                                            {tax.type === 'PERCENT' ? <Percent size={20} /> : <DollarSign size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">{tax.name}</h3>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Berlaku untuk semua transaksi</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(tax.id)}
                                        className={`w-12 h-6 rounded-full transition-all relative ${tax.isActive ? 'bg-red-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tax.isActive ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Nilai</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={tax.value}
                                                className="w-full h-10 bg-slate-50 rounded-xl px-4 text-sm font-bold border-none outline-none focus:ring-1 ring-red-200"
                                            />
                                            <span className="text-sm font-bold text-slate-400">{tax.type === 'PERCENT' ? '%' : 'Rp'}</span>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center self-end">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-50">
                        <h2 className="text-xs font-bold text-slate-700 uppercase">Opsi Lanjutan</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Harga Produk Sudah Termasuk Pajak</p>
                                <p className="text-[10px] text-slate-400 mt-1">Nett price / Included tax</p>
                            </div>
                            <button className="w-12 h-6 rounded-full bg-slate-200 relative">
                                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Bulatkan Total Pembayaran</p>
                                <p className="text-[10px] text-slate-400 mt-1">Round to nearest Rp 100</p>
                            </div>
                            <button className="w-12 h-6 rounded-full bg-red-500 relative">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                    {isSaving ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Simpan Pengaturan"
                    )}
                </button>
            </div>
        </div>
    );
}
