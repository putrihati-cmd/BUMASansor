"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Bell,
    AlertTriangle,
    Clock,
    CreditCard,
    ChevronRight,
    Settings,
    MoreVertical
} from "lucide-react";

export default function RemindersPage() {
    const router = useRouter();

    const reminders = [
        {
            id: '1',
            title: 'Stok Menipis',
            message: '5 produk sudah mencapai batas minimum stok.',
            icon: AlertTriangle,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            time: '2 jam yang lalu',
            type: 'STOCK'
        },
        {
            id: '2',
            title: 'Kasbon Jatuh Tempo',
            message: 'Budi Santoso memiliki hutang Rp 50.000 yang belum dibayar.',
            icon: CreditCard,
            color: 'text-red-500',
            bg: 'bg-red-50',
            time: '5 jam yang lalu',
            type: 'DEBT'
        },
        {
            id: '3',
            title: 'Kehadiran Pegawai',
            message: 'Siti Aminah belum melakukan absen masuk hari ini.',
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            time: '08:00 AM',
            type: 'ATTENDANCE'
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800 flex-1 text-center pr-8">Pengingat</h1>
                </div>
            </div>

            <div className="flex-1 p-5 space-y-6">
                {/* Status Summary */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-lg shadow-red-200 flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Total Aktif</p>
                        <h2 className="text-3xl font-black">{reminders.length} Pengingat</h2>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Bell size={28} className="animate-bounce" />
                    </div>
                </div>

                {/* Reminder List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktivitas Terbaru</h3>
                        <button className="text-red-500 text-[10px] font-black uppercase">Tandai Dibaca Semua</button>
                    </div>

                    <div className="space-y-3">
                        {reminders.map((r) => (
                            <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-4 active:bg-slate-50 transition-all cursor-pointer group">
                                <div className={`w-12 h-12 rounded-2xl ${r.bg} ${r.color} flex items-center justify-center shrink-0`}>
                                    <r.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-800 text-sm">{r.title}</h4>
                                        <span className="text-[9px] text-slate-300 font-bold uppercase">{r.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.message}</p>
                                    <button className="mt-3 text-[10px] font-black text-red-500 uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Lihat Detail
                                        <ChevronRight size={10} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Setting CTA */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                            <Settings size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">Atur Pengingat</h4>
                            <p className="text-[10px] text-slate-400">Sesuaikan waktu dan jenis pengingat</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                </div>
            </div>
        </div>
    );
}
