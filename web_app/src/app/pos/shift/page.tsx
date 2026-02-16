"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useShiftStore } from "@/store/shiftStore";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Unlock,
    Lock,
    Wallet,
    Clock,
    History,
    Loader2,
    Calendar,
    ChevronRight,
    AlertCircle
} from "lucide-react";

export default function ShiftPage() {
    const { user } = useAuthStore();
    const { currentShift, setCurrentShift } = useShiftStore();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [startCash, setStartCash] = useState("0");
    const [endCash, setEndCash] = useState("0");
    const [notes, setNotes] = useState("");
    const [shiftHistory, setShiftHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.warungId) {
            fetchHistory();
            fetchCurrentShift();
        }
    }, [user?.warungId]);

    const fetchCurrentShift = async () => {
        try {
            const res = await api.get(`/shifts/current?warungId=${user?.warungId}`);
            if (res.data) setCurrentShift(res.data);
        } catch (err) {
            console.error("Failed to fetch current shift", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/shifts?warungId=${user?.warungId}`);
            setShiftHistory(res.data || []);
        } catch (err) {
            console.error("Failed to fetch shift history", err);
        }
    };

    const handleOpenShift = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post(`/shifts/open?warungId=${user?.warungId}`, {
                startCash: Number(startCash),
                notes
            });
            setCurrentShift(res.data);
            setStartCash("0");
            setNotes("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Gagal membuka shift");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseShift = async () => {
        if (!currentShift) return;
        setIsLoading(true);
        setError(null);
        try {
            await api.post(`/shifts/${currentShift.id}/close`, {
                endCash: Number(endCash),
                notes
            });
            setCurrentShift(null);
            setEndCash("0");
            setNotes("");
            fetchHistory();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Gagal menutup shift");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Shift Kasir</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {/* Active Shift Card */}
                {currentShift ? (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Shift Aktif</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Mulai</p>
                                <p className="text-sm font-bold text-slate-900">
                                    {new Date(currentShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Modal Awal</p>
                                <p className="text-sm font-bold text-slate-900">{formatCurrency(currentShift.startCash)}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-2 block">Uang Akhir di Laci (Cash + Modal)</label>
                                <input
                                    type="number"
                                    value={endCash}
                                    onChange={(e) => setEndCash(e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary outline-none font-bold"
                                    placeholder="Masukkan total uang cash"
                                />
                            </div>
                            <button
                                onClick={handleCloseShift}
                                disabled={isLoading}
                                className="w-full h-12 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                                Tutup Shift Sekarang
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Unlock size={24} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">Buka Shift Baru</h2>
                                <p className="text-xs text-slate-500">Siapkan kas untuk mulai berjualan</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-2 block">Modal Awal (Kas Kecil)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                                    <input
                                        type="number"
                                        value={startCash}
                                        onChange={(e) => setStartCash(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-primary outline-none text-lg font-bold"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 italic">* Uang tunai yang ada di laci saat ini</p>
                            </div>

                            <button
                                onClick={handleOpenShift}
                                disabled={isLoading}
                                className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Unlock size={20} />}
                                Mulai Berjualan
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                        <p className="text-xs font-semibold text-red-600">{error}</p>
                    </div>
                )}

                {/* History Section */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <History size={18} className="text-slate-400" />
                            Riwayat Shift
                        </h3>
                    </div>

                    <div className="space-y-3 pb-8">
                        {shiftHistory.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
                                <Calendar className="mx-auto text-slate-200 mb-2" size={32} />
                                <p className="text-sm text-slate-400">Belum ada riwayat shift</p>
                            </div>
                        ) : (
                            shiftHistory.map((sh) => (
                                <div key={sh.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sh.endTime ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-600'}`}>
                                            {sh.endTime ? <Lock size={18} /> : <Unlock size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {new Date(sh.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                {new Date(sh.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {sh.endTime ? new Date(sh.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sekarang'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">{formatCurrency(sh.totalActual || sh.startCash)}</p>
                                        <p className="text-[10px] text-slate-400">Total Kas</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
