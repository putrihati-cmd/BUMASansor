"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { User, Search, Plus, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerSelector() {
    const { customer, setCustomer, warungId } = useCartStore((state: any) => ({
        customer: state.customer,
        setCustomer: state.setCustomer,
        warungId: useAuthStore.getState().user?.warungId
    }));

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && warungId) {
            fetchCustomers();
        }
    }, [isOpen, warungId]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/customers?warungId=${warungId}`);
            setCustomers(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Failed to fetch customers", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    );

    return (
        <div className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700">Pelanggan</h2>
                {customer && (
                    <button
                        onClick={() => setCustomer(null)}
                        className="text-[10px] font-bold text-red-500 uppercase tracking-wider"
                    >
                        Lepas
                    </button>
                )}
            </div>

            <div className="p-4">
                {customer ? (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{customer.name}</h4>
                            <p className="text-xs text-slate-500">{customer.phone || 'No phone'}</p>
                        </div>
                        <Check size={18} className="text-primary" />
                    </div>
                ) : (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <Plus size={20} />
                        </div>
                        <span className="text-sm font-medium">Pilih Pelanggan</span>
                    </button>
                )}
            </div>

            {/* Modal Selector */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl max-h-[80vh] flex flex-col"
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Pilih Pelanggan</h3>
                                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 rounded-full">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau nomor..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                        <p className="text-sm text-slate-400 mt-2">Memuat data...</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <p className="text-sm">Pelanggan tidak ditemukan</p>
                                    </div>
                                ) : (
                                    filtered.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setCustomer(c);
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                                                <p className="text-xs text-slate-500">{c.phone || '-'}</p>
                                            </div>
                                            {customer?.id === c.id && <Check size={18} className="text-primary" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
