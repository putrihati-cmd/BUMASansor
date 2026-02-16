"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Globe } from "lucide-react";

export default function OnlineCatalogPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100 flex items-center gap-4 px-5 py-4 sticky top-0 z-20 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-lg text-slate-800">Katalog Online</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                    <Globe size={48} className="text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Toko Online Kamu</h2>
                <p className="text-slate-500 max-w-xs">
                    Integrasi dengan GrabFood, GoFood dan Website Usaha akan tersedia di sini.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-8 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                >
                    Kembali
                </button>
            </div>
        </div>
    );
}
