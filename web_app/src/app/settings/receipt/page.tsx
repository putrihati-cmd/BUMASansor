"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Image as ImageIcon,
    Save,
    Type,
    Layout,
    List,
    Smartphone,
    Eye
} from "lucide-react";

export default function ReceiptSettingsPage() {
    const router = useRouter();
    const [header, setHeader] = useState("BUMAS Ansor - Outlet Pusat");
    const [footer, setFooter] = useState("Terima kasih telah berbelanja!");
    const [showLogo, setShowLogo] = useState(true);

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
                    <h1 className="font-bold text-lg text-slate-800">Struk & Tampilan</h1>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Save size={18} />
                </button>
            </div>

            <div className="flex-1 p-5 space-y-8 pb-32">
                {/* Preview Section */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4">Preview Struk</h3>
                    <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-200 shadow-inner max-w-[280px] mx-auto space-y-4">
                        <div className="text-center space-y-1">
                            {showLogo && <div className="w-10 h-10 bg-slate-100 rounded-full mx-auto mb-2" />}
                            <p className="text-[10px] font-black text-slate-800 uppercase leading-tight">{header}</p>
                            <p className="text-[8px] text-slate-400">Jl. Raya No. 123, Jakarta</p>
                        </div>
                        <div className="border-t border-slate-100 border-dashed pt-4 space-y-2">
                            <div className="flex justify-between text-[8px] font-bold text-slate-600">
                                <span>Kopi Kenangan</span>
                                <span>25.000</span>
                            </div>
                            <div className="flex justify-between text-[8px] font-bold text-slate-600">
                                <span>Donat Gula</span>
                                <span>12.000</span>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 border-dashed pt-4 flex justify-between font-black text-slate-800 text-xs">
                            <span>TOTAL</span>
                            <span>37.000</span>
                        </div>
                        <div className="text-center pt-4 italic text-[8px] text-slate-400">
                            {footer}
                        </div>
                    </div>
                </div>

                {/* Configuration Fields */}
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Pengaturan Konten</label>
                        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden divide-y divide-slate-50">
                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Tampilkan Logo</p>
                                        <p className="text-[10px] text-slate-400">Gunakan logo usaha di struk</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLogo(!showLogo)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${showLogo ? 'bg-red-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showLogo ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                                        <Type size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={header}
                                        onChange={(e) => setHeader(e.target.value)}
                                        placeholder="Header Struk"
                                        className="w-full h-10 bg-slate-50 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white border-none"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                                        <Layout size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={footer}
                                        onChange={(e) => setFooter(e.target.value)}
                                        placeholder="Footer Struk"
                                        className="w-full h-10 bg-slate-50 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white border-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Jenis Kertas</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white p-4 rounded-3xl border-2 border-red-500 shadow-sm flex flex-col items-center gap-2">
                                <List size={20} className="text-red-500" />
                                <span className="text-xs font-black text-slate-800">58mm (Thermal)</span>
                            </button>
                            <button className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                                <List size={20} className="text-slate-300" />
                                <span className="text-xs font-black text-slate-400">80mm (Thermal)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 shadow-xl">
                <button className="w-full h-14 bg-red-600 text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    <Save size={20} />
                    Simpan Perubahan
                </button>
            </div>
        </div>
    );
}
