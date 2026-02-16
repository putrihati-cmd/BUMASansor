"use client";

import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CartBar({ onClick }: { onClick: () => void }) {
    const { totalItems, totalPrice } = useCartStore();

    const count = totalItems();
    const price = totalPrice();

    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-0 right-0 z-50 px-5 flex justify-center"
                >
                    <button
                        onClick={onClick}
                        className="flex w-full max-w-[440px] items-center justify-between rounded-3xl bg-slate-900 p-2 pl-5 text-white shadow-2xl active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <ShoppingCart size={24} className="text-primary-400" />
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold ring-2 ring-slate-900">
                                    {count}
                                </span>
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                    Total Belanja
                                </span>
                                <span className="text-lg font-bold">{formatCurrency(price)}</span>
                            </div>
                        </div>

                        <div className="flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold transition-colors hover:bg-primary-600">
                            Lihat Keranjang
                            <ChevronRight size={18} />
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
