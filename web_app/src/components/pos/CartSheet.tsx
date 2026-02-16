"use client";

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface CartSheetProps {
    open: boolean;
    onClose: () => void;
}

export default function CartSheet({ open, onClose }: CartSheetProps) {
    const { items, updateQty, removeItem, totalItems, totalPrice, clearCart } =
        useCartStore();
    const router = useRouter();

    const handleCheckout = () => {
        onClose();
        router.push("/pos/checkout");
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
                    >
                        <div className="mobile-container w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
                            {/* Handle */}
                            <div className="flex items-center justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-slate-200" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Keranjang
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        {totalItems()} item
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {items.length > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="text-xs text-red-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Hapus Semua
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 no-scrollbar">
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                                        <ShoppingBag size={48} strokeWidth={1.5} />
                                        <p className="mt-4 text-sm font-medium text-slate-400">
                                            Keranjang kosong
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Tambahkan produk dari katalog
                                        </p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-800 truncate">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {formatCurrency(item.price)} / pcs
                                                </p>
                                                <p className="text-sm font-bold text-primary mt-1">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() =>
                                                        item.quantity <= 1
                                                            ? removeItem(item.id)
                                                            : updateQty(item.id, item.quantity - 1)
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 active:scale-90 transition-transform"
                                                >
                                                    {item.quantity <= 1 ? (
                                                        <Trash2 size={14} className="text-red-400" />
                                                    ) : (
                                                        <Minus size={14} />
                                                    )}
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-slate-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, item.quantity + 1)
                                                    }
                                                    disabled={item.quantity >= item.stockQty}
                                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary text-white active:scale-90 transition-transform disabled:bg-slate-200 disabled:text-slate-400"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {items.length > 0 && (
                                <div className="px-6 py-4 border-t border-slate-100 bg-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-500">Total</span>
                                        <span className="text-xl font-extrabold text-slate-900">
                                            {formatCurrency(totalPrice())}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform text-base"
                                    >
                                        Lanjut ke Pembayaran
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
