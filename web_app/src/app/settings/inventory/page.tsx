"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Construction } from "lucide-react";

export default function MockSettingsPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-lg text-slate-800">Detail Pengaturan</h1>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-6">
                    <Construction size={40} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Segera Hadir</h3>
                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">Fitur ini sedang dalam pengembangan untuk versi BUMAS Ansor berikutnya.</p>
            </div>
        </div>
    );
}
