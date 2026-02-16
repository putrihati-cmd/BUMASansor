"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Calendar,
    CreditCard,
    DollarSign,
    QrCode,
    Smartphone,
    ChevronRight,
    ArrowUpRight,
    PieChart,
    Banknote
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PaymentMethodsReportPage() {
    const router = useRouter();

    const paymentStats = [
        { type: 'CASH', label: 'Tunai', total: 8450000, count: 156, percentage: 65, color: 'bg-green-500', text: 'text-green-500', bg: 'bg-green-50', icon: Banknote },
        { type: 'QRIS', label: 'QRIS BUMAS', total: 3250000, count: 48, percentage: 25, color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50', icon: QrCode },
        { type: 'TRANSFER', label: 'Transfer Bank', total: 1300000, count: 12, percentage: 10, color: 'bg-orange-500', text: 'text-orange-500', bg: 'bg-orange-50', icon: Smartphone },
    ];

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
                    <h1 className="font-bold text-lg text-slate-800">Metode Pembayaran</h1>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <Calendar size={18} />
                </button>
            </div>

            <div className="flex-1 p-5 space-y-8 pb-10">
                {/* Main Pie Chart Visualization Placeholder */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-48 h-48 rounded-full border-[16px] border-slate-50 relative flex items-center justify-center mb-8">
                        {/* CSS-only Donut segments would be complex, using a simple placeholder representation */}
                        <div className="absolute inset-0 rounded-full border-[16px] border-green-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }} />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Volume Terbesar</p>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">Tunai</h3>
                            <p className="text-xs font-bold text-green-500">65%</p>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-4">
                        {paymentStats.map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className={`h-1.5 w-full rounded-full ${item.color}`} />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ringkasan Nilai</h3>
                    <div className="space-y-3">
                        {paymentStats.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 ${item.bg} ${item.text} rounded-[20px] flex items-center justify-center shrink-0`}>
                                        <item.icon size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.label}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.count} Transaksi</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-800">{formatCurrency(item.total)}</p>
                                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-slate-400 mt-0.5 uppercase">
                                        <ArrowUpRight size={10} className="text-green-500" />
                                        {item.percentage}% Total
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Integration Banner */}
                <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <QrCode size={100} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Aktifkan QRIS Dinamis</h3>
                            <p className="text-xs text-indigo-100 leading-relaxed font-medium mt-1">
                                Kurangi resiko selisih kas tunai dengan menerima pembayaran QRIS yang langsung masuk ke rekening tokomu.
                            </p>
                        </div>
                        <button className="h-12 bg-white text-indigo-600 font-bold px-8 rounded-2xl active:scale-95 transition-all text-sm">Pelajari Lebih Lanjut</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
