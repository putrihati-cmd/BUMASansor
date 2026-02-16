"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useShiftStore } from "@/store/shiftStore";
import CustomerSelector from "@/components/pos/CustomerSelector";
import DiscountTaxSelector from "@/components/pos/DiscountTaxSelector";
import {
    ArrowLeft,
    Banknote,
    CreditCard,
    QrCode,
    Smartphone,
    Minus,
    Plus,
    Trash2,
    Loader2,
} from "lucide-react";

const PAYMENT_METHODS = [
    { id: "CASH", label: "Tunai", icon: Banknote, color: "bg-green-500" },
    { id: "TRANSFER", label: "Transfer", icon: CreditCard, color: "bg-blue-500" },
    { id: "QRIS", label: "QRIS", icon: QrCode, color: "bg-purple-500" },
    { id: "EDC", label: "EDC", icon: Smartphone, color: "bg-orange-500" },
];

export default function CheckoutPage() {
    const {
        items,
        totalPrice,
        totalItems,
        updateQty,
        removeItem,
        clearCart,
        customer,
        calculateDiscount,
        calculateTax,
        subtotal
    } = useCartStore();
    const { user } = useAuthStore();
    const { currentShift } = useShiftStore();
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const [cashReceived, setCashReceived] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const total = totalPrice();
    const sub = subtotal();
    const disc = calculateDiscount();
    const tax = calculateTax();
    const cashAmount = Number(cashReceived) || 0;
    const change = paymentMethod === "CASH" ? cashAmount - total : 0;
    const canProcess =
        paymentMethod === "CASH" ? (total <= 0 ? true : cashAmount >= total) : true;

    const quickAmounts = [
        total,
        Math.ceil(total / 10000) * 10000,
        Math.ceil(total / 50000) * 50000,
        Math.ceil(total / 100000) * 100000,
    ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total);

    const handleProcess = async () => {
        if (!user?.warungId || items.length === 0) return;

        if (!currentShift) {
            setError("Shift kasir belum dibuka. Silakan buka kasir terlebih dahulu.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const payload = {
                warungId: user.warungId,
                shiftId: currentShift.id,
                customerId: customer?.id || null,
                items: items.map((item) => ({
                    warungProductId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount,
                })),
                paymentMethod,
                discountAmount: disc,
                taxAmount: tax,
                paidAmount: paymentMethod === "CASH" ? cashAmount : total,
            };

            const res = await api.post("/sales", payload);
            const sale = res.data?.data || res.data;

            clearCart();
            router.push(`/pos/receipt/${sale.id}`);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Gagal memproses transaksi. Silakan coba lagi."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col h-screen bg-white">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Checkout</h1>
                </div>
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    <p className="text-center text-sm">
                        Keranjang kosong. Kembali ke katalog.
                    </p>
                </div>
            </div>
        );
    }

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
                <div>
                    <h1 className="text-lg font-bold text-slate-900">Checkout</h1>
                    <p className="text-xs text-slate-500">{totalItems()} item</p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                {/* Cart Items */}
                <div className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-700">Ringkasan Pesanan</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <div key={item.instanceId} className="flex items-center gap-3 px-4 py-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                                        {item.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {formatCurrency(item.price)} × {item.quantity}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() =>
                                            item.quantity <= 1
                                                ? removeItem(item.instanceId)
                                                : updateQty(item.instanceId, item.quantity - 1)
                                        }
                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                                    >
                                        {item.quantity <= 1 ? (
                                            <Trash2 size={12} className="text-red-400" />
                                        ) : (
                                            <Minus size={12} />
                                        )}
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQty(item.instanceId, item.quantity + 1)}
                                        disabled={item.quantity >= item.stockQty}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white disabled:bg-slate-200"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                                <p className="text-sm font-bold text-slate-900 w-20 text-right">
                                    {formatCurrency(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>
                    {/* Subtotal ringkasan */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(sub)}</span>
                        </div>
                        {disc > 0 && (
                            <div className="flex justify-between text-xs text-red-500">
                                <span>Diskon</span>
                                <span>-{formatCurrency(disc)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between text-xs text-blue-500">
                                <span>Pajak</span>
                                <span>+{formatCurrency(tax)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Customer Selection */}
                <CustomerSelector />

                {/* Discount & Tax Selector */}
                <DiscountTaxSelector />

                {/* Payment Method */}
                <div className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-700">Metode Pembayaran</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-2 p-4">
                        {PAYMENT_METHODS.map((pm) => {
                            const Icon = pm.icon;
                            const isActive = paymentMethod === pm.id;
                            return (
                                <button
                                    key={pm.id}
                                    onClick={() => {
                                        setPaymentMethod(pm.id);
                                        if (pm.id !== "CASH") setCashReceived("");
                                    }}
                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${isActive
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-100 bg-white"
                                        }`}
                                >
                                    <div
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl ${isActive ? pm.color : "bg-slate-100"
                                            } transition-colors`}
                                    >
                                        <Icon
                                            size={18}
                                            className={isActive ? "text-white" : "text-slate-400"}
                                        />
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-slate-500"
                                            }`}
                                    >
                                        {pm.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Cash Input (only for CASH) */}
                {paymentMethod === "CASH" && (
                    <div className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-700">Uang Diterima</h2>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-3">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    placeholder="0"
                                    className="w-full h-14 pl-12 pr-4 text-right text-2xl font-extrabold text-slate-900 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {quickAmounts.slice(0, 4).map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setCashReceived(String(amount))}
                                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${cashAmount === amount
                                            ? "bg-primary text-white"
                                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>

                            {cashAmount > 0 && cashAmount >= total && (
                                <div className="mt-4 p-3 bg-green-50 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-medium text-green-700">
                                        Kembalian
                                    </span>
                                    <span className="text-lg font-extrabold text-green-700">
                                        {formatCurrency(change)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mx-4 mt-4 p-3 bg-red-50 rounded-xl text-red-600 text-sm font-medium text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Bottom Fixed */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-center z-50">
                <div className="mobile-container w-full px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Bayar</span>
                        <span className="text-2xl font-extrabold text-slate-900">
                            {formatCurrency(total)}
                        </span>
                    </div>
                    <button
                        onClick={handleProcess}
                        disabled={!canProcess || isProcessing || items.length === 0}
                        className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all text-base disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Proses Pembayaran"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
