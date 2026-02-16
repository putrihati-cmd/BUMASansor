"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    CreditCard,
    DollarSign,
    QrCode,
    Smartphone,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    ShoppingBag
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PaymentsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const paymentSummary = [
        { type: 'CASH', label: 'Tunai', total: 1250000, count: 24, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
        { type: 'QRIS', label: 'QRIS', total: 450000, count: 8, icon: QrCode, color: 'text-blue-500', bg: 'bg-blue-50' },
        { type: 'TRANSFER', label: 'Transfer Bank', total: 300000, count: 3, icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-50' },
        { type: 'CARD', label: 'Kartu Debit/Kredit', total: 0, count: 0, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const recentPayments = [
        { id: '1', invoice: '#INV-2001', amount: 45000, method: 'CASH', time: '14:20' },
        { id: '2', invoice: '#INV-2002', amount: 120000, method: 'QRIS', time: '13:45' },
        { id: '3', invoice: '#INV-2003', amount: 25000, method: 'CASH', time: '12:10' },
    ];

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
                <h1 className="font-bold text-lg text-slate-800 flex-1 text-center pr-8">Pembayaran</h1>
            </div>

            <div className="flex-1 p-5 space-y-8 pb-10">
                {/* Total Summary Card */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-[40px] p-8 text-white shadow-xl shadow-red-100 flex items-center justify-between">
                    <div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Total Pendapatan</p>
                        <h2 className="text-3xl font-black">{formatCurrency(2000000)}</h2>
                        <div className="mt-4 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                            <ShoppingBag size={12} className="text-white/60" />
                            <span className="text-[10px] font-bold tracking-wider">35 TRANSAKSI</span>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <ArrowUpRight size={28} />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {paymentSummary.map((item, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4 active:scale-[0.96] transition-all">
                            <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-lg shadow-black/5`}>
                                <item.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className="text-sm font-black text-slate-800 mt-1">{formatCurrency(item.total)}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.count} TRANSAKSI</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Aktivitas Terkini</h3>
                        <button className="text-red-500 text-[10px] font-black uppercase">Lihat Grafik</button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {recentPayments.map((p) => (
                            <div key={p.id} className="p-5 flex items-center justify-between active:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{p.invoice}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{p.time} • {p.method}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900">{formatCurrency(p.amount)}</p>
                                    <span className="text-[8px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Berhasil</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Section */}
                <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center justify-between shadow-sm active:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                            <QrCode size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">Aktifkan QRIS Dinamis</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Terima pembayaran otomatis & instan</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                </div>
            </div>
        </div>
    );
}
