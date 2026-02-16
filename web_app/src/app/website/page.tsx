"use client";

import { Globe, ArrowLeft, ExternalLink, Settings, Layout, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function WebsitePage() {
    const router = useRouter();

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
                <h1 className="text-lg font-bold text-slate-900">Website Usaha</h1>
            </div>

            <div className="flex-1 p-5 space-y-6">
                {/* Status Card */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-lg shadow-red-200">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Globe size={24} />
                        </div>
                        <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Segera Hadir
                        </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Toko Online Kamu</h2>
                    <p className="text-red-100 text-sm leading-relaxed mb-6 opacity-90">
                        Satu website untuk semua kebutuhan jualanmu. Kelola produk, terima pesanan, dan bangun brand kamu sendiri dengan mudah.
                    </p>
                    <button className="w-full h-12 bg-white text-red-600 font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        Siapkan Sekarang
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                            <Layout size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Tema Custom</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Sesuaikan tampilan toko sesukamu.</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Social Share</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Berbagi ke WhatsApp & Media Sosial.</p>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <h3 className="font-bold text-slate-700 text-sm">Pengaturan Website</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <button className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                    <Globe size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-600">Domain & URL</span>
                            </div>
                            <ExternalLink size={14} className="text-slate-300" />
                        </button>
                        <button className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                    <Settings size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-600">Konfigurasi Toko</span>
                            </div>
                            <ExternalLink size={14} className="text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* Preview Placeholder */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                        <Globe size={40} className="text-red-300 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Preview Belum Tersedia</h3>
                        <p className="text-xs text-slate-400 mt-2 max-w-[200px]">Aktifkan fitur Website Usaha untuk melihat tampilan toko online kamu.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
