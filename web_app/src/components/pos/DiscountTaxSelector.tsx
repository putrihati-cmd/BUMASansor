"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Tag, Percent, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function DiscountTaxSelector() {
    const {
        discountAmount,
        discountType,
        setDiscount,
        taxAmount,
        taxType,
        setTax,
        subtotal,
        calculateDiscount,
        calculateTax
    } = useCartStore();

    const [isOpen, setIsOpen] = useState(false);
    const [tempDiscount, setTempDiscount] = useState(String(discountAmount));
    const [tempDiscountType, setTempDiscountType] = useState<"FIXED" | "PERCENT">(discountType);
    const [tempTax, setTempTax] = useState(String(taxAmount));
    const [tempTaxType, setTempTaxType] = useState<"FIXED" | "PERCENT">(taxType);

    const totalSub = subtotal();

    // Preview calculations
    const previewDiscount = tempDiscountType === "PERCENT"
        ? (totalSub * (Number(tempDiscount) || 0)) / 100
        : (Number(tempDiscount) || 0);

    const previewTax = tempTaxType === "PERCENT"
        ? (totalSub * (Number(tempTax) || 0)) / 100
        : (Number(tempTax) || 0);

    const handleApply = () => {
        setDiscount(Number(tempDiscount) || 0, tempDiscountType);
        setTax(Number(tempTax) || 0, tempTaxType);
        setIsOpen(false);
    };

    return (
        <div className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(true)}
                className="w-full px-4 py-4 flex items-center justify-between active:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3 font-bold text-slate-700">
                    <Tag size={18} className="text-primary" />
                    <span className="text-sm">Diskon & Pajak</span>
                </div>
                <div className="flex items-center gap-2">
                    {(discountAmount > 0 || taxAmount > 0) && (
                        <div className="flex items-center gap-1.5">
                            {discountAmount > 0 && (
                                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    -{formatCurrency(calculateDiscount())}
                                </span>
                            )}
                            {taxAmount > 0 && (
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    +{formatCurrency(calculateTax())}
                                </span>
                            )}
                        </div>
                    )}
                    <ChevronRight size={18} className="text-slate-300" />
                </div>
            </button>

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
                            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl p-6 flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Atur Diskon & Pajak</h3>
                                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 rounded-full">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Discount Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Diskon Total
                                        </label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setTempDiscountType("FIXED")}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tempDiscountType === "FIXED" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
                                            >
                                                Rp
                                            </button>
                                            <button
                                                onClick={() => setTempDiscountType("PERCENT")}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tempDiscountType === "PERCENT" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
                                            >
                                                %
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tempDiscount}
                                            onChange={(e) => setTempDiscount(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-red-400 outline-none text-right font-extrabold text-red-600 text-lg"
                                        />
                                        {tempDiscountType === "PERCENT" && (
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                                {formatCurrency(previewDiscount)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tax Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Pajak / Biaya Lain
                                        </label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setTempTaxType("FIXED")}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tempTaxType === "FIXED" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
                                            >
                                                Rp
                                            </button>
                                            <button
                                                onClick={() => setTempTaxType("PERCENT")}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tempTaxType === "PERCENT" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
                                            >
                                                %
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tempTax}
                                            onChange={(e) => setTempTax(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-400 outline-none text-right font-extrabold text-blue-600 text-lg"
                                        />
                                        {tempTaxType === "PERCENT" && (
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                                {formatCurrency(previewTax)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 mt-2">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(totalSub)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-red-500">
                                    <span>Potongan Diskon</span>
                                    <span>-{formatCurrency(previewDiscount)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-blue-500">
                                    <span>Tambahan Pajak</span>
                                    <span>+{formatCurrency(previewTax)}</span>
                                </div>
                                <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-3 mt-1">
                                    <span>Estimasi Total</span>
                                    <span>{formatCurrency(totalSub - previewDiscount + previewTax)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleApply}
                                className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
                            >
                                Simpan Perubahan
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
