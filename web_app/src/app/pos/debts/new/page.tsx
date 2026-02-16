"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
    ArrowLeft,
    User,
    Calendar,
    DollarSign,
    Clipboard,
    CheckCircle2,
    Loader2,
    Search,
    X,
    Plus,
} from "lucide-react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

export default function NewDebtPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [customers, setCustomers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState(dayjs().add(7, "days").format("YYYY-MM-DD"));
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            if (!user?.warungId) return;
            try {
                const res = await api.get("/customers", {
                    params: { warungId: user.warungId },
                });
                setCustomers(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCustomers();
    }, [user?.warungId]);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );

    const handleSubmit = async () => {
        if (!selectedCustomer || !amount || Number(amount) <= 0) return;
        setSubmitting(true);
        try {
            await api.post("/debts", {
                warungId: user?.warungId,
                customerId: selectedCustomer.id,
                amount: Number(amount),
                dueDate: new Date(dueDate),
                notes,
            });
            router.push("/pos/debts");
        } catch (err) {
            alert("Gagal menambahkan hutang");
        } finally {
            setSubmitting(false);
        }
    };

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
                <h1 className="text-lg font-bold text-slate-900">Tambah Hutang</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
                {/* Customer Section */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pelanggan</label>
                    {selectedCustomer ? (
                        <div className="bg-white p-4 rounded-2xl border-2 border-primary/20 flex items-center gap-4 relative">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{selectedCustomer.name}</p>
                                <p className="text-[10px] text-slate-500">{selectedCustomer.phone || "No HP -"}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCustomerSearch(true)}
                            className="w-full h-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-medium hover:border-primary/40 hover:text-primary transition-all"
                        >
                            <Plus size={18} />
                            Pilih Pelanggan
                        </button>
                    )}
                </div>

                {/* Amount Section */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jumlah Hutang</label>
                    <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">Rp</div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full h-16 pl-16 pr-6 bg-white border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 outline-none focus:border-primary/50 transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Due Date Section */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Batas Waktu Pelunasan</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full h-14 pl-12 pr-6 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Catatan</label>
                    <div className="relative">
                        <Clipboard className="absolute left-4 top-4 text-slate-400" size={20} />
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-32 pl-12 pr-6 pt-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:border-primary/50 transition-all resize-none"
                            placeholder="Alasan hutang (misal: Sembako minggu ini)"
                        />
                    </div>
                </div>

                <div className="h-20" />
            </div>

            {/* Save Button */}
            <div className="p-4 bg-white border-t border-slate-100">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedCustomer || !amount || Number(amount) <= 0}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                    Simpan Hutang
                </button>
            </div>

            {/* Customer Search Overlay */}
            <AnimatePresence>
                {showCustomerSearch && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-white z-[60] flex flex-col"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setShowCustomerSearch(false)} className="text-slate-500">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Cari nama atau No HP..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border-none outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredCustomers.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setSelectedCustomer(c);
                                        setShowCustomerSearch(false);
                                    }}
                                    className="w-full p-4 bg-white rounded-xl border border-slate-100 flex items-center gap-3 text-left active:bg-slate-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center font-bold">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">{c.name}</p>
                                        <p className="text-[10px] text-slate-400">{c.phone || "Tanpa No HP"}</p>
                                    </div>
                                    <Plus size={16} className="text-primary" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
