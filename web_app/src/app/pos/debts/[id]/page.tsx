"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    User,
    Calendar,
    Receipt,
    History,
    ChevronDown,
    ChevronUp,
    Plus,
    Loader2,
} from "lucide-react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

interface Payment {
    id: string;
    amount: number;
    paymentDate: string;
    method: string;
    notes?: string;
}

interface DebtDetail {
    id: string;
    amount: number;
    paidAmount: number;
    balance: number;
    dueDate: string;
    status: string;
    customer: { name: string; phone?: string; address?: string };
    sale?: {
        invoiceNumber: string;
        items: any[];
    };
    payments: Payment[];
    createdAt: string;
}

export default function DebtDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [debt, setDebt] = useState<DebtDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [payMethod, setPayMethod] = useState("CASH");
    const [payNotes, setPayNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchDebt = async () => {
        try {
            const res = await api.get(`/debts/${params.id}`);
            setDebt(res.data);
            setPayAmount(String(res.data.balance));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchDebt();
    }, [params.id]);

    const handlePay = async () => {
        if (!payAmount || Number(payAmount) <= 0) return;
        setSubmitting(true);
        try {
            await api.post(`/debts/${params.id}/pay`, {
                amount: Number(payAmount),
                method: payMethod,
                notes: payNotes,
            });
            setShowPayModal(false);
            fetchDebt();
        } catch (err) {
            alert("Gagal memproses pembayaran");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="mt-4 text-sm text-slate-500">Memuat detail hutang...</p>
            </div>
        );
    }

    if (!debt) return null;

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center gap-3 px-5 py-4">
                <button
                    onClick={() => router.push("/pos/debts")}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900">Detail Hutang</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        #{debt.sale?.invoiceNumber || debt.id.slice(0, 8)}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${debt.status === "PAID" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                    }`}>
                    {debt.status === "PAID" ? "LUNAS" : "BELUM LUNAS"}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {/* Summary Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Sisa Hutang</p>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        {formatCurrency(Number(debt.balance))}
                    </h2>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Sudah Dibayar</p>
                            <p className="text-sm font-bold text-green-500">{formatCurrency(Number(debt.paidAmount))}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Awal</p>
                            <p className="text-sm font-bold text-slate-400">{formatCurrency(Number(debt.amount))}</p>
                        </div>
                    </div>
                </div>

                {/* Info List */}
                <div className="space-y-3">
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Pelanggan</p>
                            <p className="text-sm font-bold text-slate-800">{debt.customer.name}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Jatuh Tempo</p>
                            <p className="text-sm font-bold text-slate-800">
                                {dayjs(debt.dueDate).format("DD MMMM YYYY")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items List (if attached to sale) */}
                {debt.sale && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt size={16} className="text-primary" />
                                <span className="text-xs font-bold text-slate-800">Item Transaksi</span>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {debt.sale.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{item.warungProduct.product.name}</p>
                                        <p className="text-slate-400">{item.quantity} x {formatCurrency(Number(item.price))}</p>
                                    </div>
                                    <p className="font-extrabold text-slate-900">{formatCurrency(Number(item.subtotal))}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment History */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2">
                        <History size={16} className="text-primary" />
                        <span className="text-xs font-bold text-slate-800">Riwayat Cicilan</span>
                    </div>
                    {debt.payments.length === 0 ? (
                        <div className="p-8 text-center text-[11px] text-slate-400 italic">
                            Belum ada pembayaran cicilan
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {debt.payments.map((p) => (
                                <div key={p.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-extrabold text-slate-800">{formatCurrency(Number(p.amount))}</p>
                                        <p className="text-[10px] text-slate-400">{dayjs(p.paymentDate).format("DD/MM/YY HH:mm")} • {p.method}</p>
                                    </div>
                                    {p.notes && <p className="text-[10px] text-slate-400 italic max-w-[40%] truncate">{p.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="h-20" />
            </div>

            {/* Actions */}
            {debt.status !== "PAID" && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3">
                    <button
                        onClick={() => setShowPayModal(true)}
                        className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Bayar Cicilan
                    </button>
                </div>
            )}

            {/* Payment Modal */}
            <AnimatePresence>
                {showPayModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPayModal(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-50 p-8 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Bayar Hutang</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jumlah Bayar</label>
                                    <input
                                        type="number"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 outline-none focus:border-primary/50 transition-all"
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-slate-400 text-right pr-1 italic">Maks: {formatCurrency(Number(debt.balance))}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Metode Pembayaran</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["CASH", "TRANSFER"].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setPayMethod(m)}
                                                className={`h-12 rounded-xl font-bold text-sm transition-all ${payMethod === m ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "bg-slate-50 text-slate-500 border border-slate-100"
                                                    }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Catatan (Optional)</label>
                                    <textarea
                                        value={payNotes}
                                        onChange={(e) => setPayNotes(e.target.value)}
                                        className="w-full h-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:border-primary/50 transition-all resize-none"
                                        placeholder="Tulis catatan di sini..."
                                    />
                                </div>

                                <button
                                    onClick={handlePay}
                                    disabled={submitting || !payAmount || Number(payAmount) <= 0 || Number(payAmount) > Number(debt.balance)}
                                    className="w-full h-16 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                                    Konfirmasi Pembayaran
                                </button>
                                <div className="h-4" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
