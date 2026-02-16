"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    DollarSign,
    Wallet,
    ArrowRight,
    Plus,
    Minus,
    History,
    TrendingUp,
    TrendingDown,
    Lock
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CashRecapPage() {
    const router = useRouter();
    const [isOpened, setIsOpened] = useState(false);
    const [modalAwal, setModalAwal] = useState("");
    const [hasStarted, setHasStarted] = useState(false);

    // Mock data for cash movements
    const transactions = [
        { id: '1', type: 'IN', label: 'Modal Awal', amount: 200000, time: '08:00', method: 'CASH' },
        { id: '2', type: 'IN', label: 'Penjualan #POS-1001', amount: 45000, time: '09:15', method: 'CASH' },
        { id: '3', type: 'OUT', label: 'Beli Galon Aqua', amount: 18000, time: '10:30', method: 'CASH' },
    ];

    const totalCash = transactions.reduce((acc, t) => acc + (t.type === 'IN' ? t.amount : -t.amount), 0);

    const handleOpenRegister = () => {
        setHasStarted(true);
        setIsOpened(false);
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
                    <h1 className="font-bold text-lg text-slate-800">Kelola Kas</h1>
                </div>
                {hasStarted && (
                    <button className="text-red-600 font-bold text-xs uppercase bg-red-50 px-3 py-1.5 rounded-full">Tutup Kasir</button>
                )}
            </div>

            {!hasStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-red-100 relative">
                        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
                        <Wallet size={64} className="text-red-500 relative z-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Kasir Belum Dibuka</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mb-10 font-medium">
                        Catat modal awal untuk mulai menerima transaksi tunai dan pantau arus kasmu.
                    </p>
                    <button
                        onClick={() => setIsOpened(true)}
                        className="w-full h-14 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <Lock size={20} />
                        Buka Kasir Sekarang
                    </button>
                </div>
            ) : (
                <div className="flex-1 p-5 space-y-6">
                    {/* Cash Status Card */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[40px] p-8 text-white shadow-xl shadow-slate-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Total Uang di Laci</p>
                                <h2 className="text-3xl font-black text-white">{formatCurrency(totalCash)}</h2>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={24} className="text-green-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                            <div>
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1">Kas Masuk</p>
                                <p className="text-sm font-black text-green-400">+ {formatCurrency(245000)}</p>
                            </div>
                            <div>
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1">Kas Keluar</p>
                                <p className="text-sm font-black text-red-400">- {formatCurrency(18000)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-4">
                        <button className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:bg-slate-50 transition-all">
                            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Pemasukan</span>
                        </button>
                        <button className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:bg-slate-50 transition-all">
                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                <Minus size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Pengeluaran</span>
                        </button>
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Aktivitas Kas</h3>
                            <button className="text-red-500 text-[10px] font-black uppercase">Laporan Detail</button>
                        </div>
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                            {transactions.map((t) => (
                                <div key={t.id} className="p-5 flex items-center justify-between active:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'IN' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                            {t.type === 'IN' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{t.label}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t.time} • {t.method}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-black ${t.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                                        {t.type === 'IN' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Buka Kasir Drawer */}
            {isOpened && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end">
                    <div className="bg-white w-full rounded-t-[40px] p-8 pb-12 shadow-2xl">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Buka Kasir</h3>
                        <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed">
                            Masukkan jumlah uang tunai yang ada di laci saat ini sebagai modal awal transaksi.
                        </p>

                        <div className="relative mb-8">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">Rp</span>
                            <input
                                type="number"
                                className="w-full h-20 bg-slate-50 border-2 border-slate-100 rounded-[32px] pl-16 pr-8 text-3xl font-black text-slate-900 focus:border-red-500 focus:bg-white transition-all outline-none"
                                placeholder="0"
                                value={modalAwal}
                                onChange={(e) => setModalAwal(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleOpenRegister}
                            className="w-full h-16 bg-red-600 text-white font-bold rounded-[32px] shadow-lg shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            Konfirmasi & Buka Kasir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
