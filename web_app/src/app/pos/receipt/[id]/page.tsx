"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import {
    CheckCircle2,
    ArrowLeft,
    Printer,
    Share2,
    Loader2,
    Receipt,
} from "lucide-react";
import dayjs from "dayjs";

interface SaleDetail {
    id: string;
    invoiceNumber: string;
    warung: { name: string; address?: string; phone?: string };
    customer?: { name: string };
    items: {
        id: string;
        warungProduct: { product: { name: string; barcode: string } };
        quantity: number;
        price: number;
        discount: number;
        subtotal: number;
    }[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    paymentMethod: string;
    createdAt: string;
}

export default function ReceiptPage() {
    const params = useParams();
    const router = useRouter();
    const [sale, setSale] = useState<SaleDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const res = await api.get(`/sales/${params.id}`);
                setSale(res.data?.data || res.data);
            } catch (err: any) {
                setError("Gagal memuat struk transaksi");
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchSale();
    }, [params.id]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (!sale) return;
        const text = `Struk ${sale.invoiceNumber}\nTotal: ${formatCurrency(sale.totalAmount)}\nTanggal: ${dayjs(sale.createdAt).format("DD/MM/YYYY HH:mm")}`;
        if (navigator.share) {
            await navigator.share({ title: "Struk BUMAS", text });
        } else {
            await navigator.clipboard.writeText(text);
            alert("Teks struk disalin ke clipboard");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="mt-4 text-sm text-slate-500">Memuat struk...</p>
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-white px-6">
                <p className="text-red-500 font-medium text-center">{error}</p>
                <button
                    onClick={() => router.push("/pos")}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium"
                >
                    Kembali ke POS
                </button>
            </div>
        );
    }

    const paymentLabel: Record<string, string> = {
        CASH: "Tunai",
        TRANSFER: "Transfer",
        QRIS: "QRIS",
        EDC: "EDC",
    };

    const change =
        sale.paymentMethod === "CASH"
            ? Number(sale.paidAmount) - Number(sale.totalAmount)
            : 0;

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100">
                <button
                    onClick={() => router.push("/pos")}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Struk Transaksi</h1>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6">
                {/* Success Banner */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                        Transaksi Berhasil!
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {dayjs(sale.createdAt).format("DD MMM YYYY, HH:mm")}
                    </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:shadow-none" id="receipt">
                    {/* Store Info */}
                    <div className="text-center px-6 py-4 border-b border-dashed border-slate-200">
                        <h3 className="text-base font-extrabold text-slate-900">
                            {sale.warung?.name || "BUMAS Ansor"}
                        </h3>
                        {sale.warung?.address && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {sale.warung.address}
                            </p>
                        )}
                        {sale.warung?.phone && (
                            <p className="text-[11px] text-slate-500">
                                Telp: {sale.warung.phone}
                            </p>
                        )}
                    </div>

                    {/* Invoice Info */}
                    <div className="px-6 py-3 border-b border-dashed border-slate-200 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>No: {sale.invoiceNumber}</span>
                            <span>{dayjs(sale.createdAt).format("HH:mm:ss")}</span>
                        </div>
                        {sale.customer && (
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>Pelanggan:</span>
                                <span className="font-bold">{sale.customer.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div className="px-6 py-3 divide-y divide-slate-50">
                        {sale.items.map((item) => (
                            <div key={item.id} className="flex justify-between py-2">
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-800">
                                        {item.warungProduct?.product?.name || "-"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {item.quantity} × {formatCurrency(Number(item.price))}
                                        {Number(item.discount) > 0 && (
                                            <span className="text-red-400 ml-1">(Disc: -{formatCurrency(Number(item.discount))})</span>
                                        )}
                                    </p>
                                </div>
                                <p className="text-xs font-bold text-slate-900">
                                    {formatCurrency(Number(item.subtotal))}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="px-6 py-3 border-t border-dashed border-slate-200 space-y-1">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-semibold text-slate-700">
                                {formatCurrency(Number(sale.subtotal))}
                            </span>
                        </div>
                        {Number(sale.discountAmount) > 0 && (
                            <div className="flex justify-between text-[11px] text-red-500">
                                <span>Diskon Global</span>
                                <span>-{formatCurrency(Number(sale.discountAmount))}</span>
                            </div>
                        )}
                        {Number(sale.taxAmount) > 0 && (
                            <div className="flex justify-between text-[11px] text-blue-500">
                                <span>Pajak</span>
                                <span>+{formatCurrency(Number(sale.taxAmount))}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base pt-1 border-t border-slate-100">
                            <span className="font-bold text-slate-900">TOTAL</span>
                            <span className="font-extrabold text-slate-900">
                                {formatCurrency(Number(sale.totalAmount))}
                            </span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="px-6 py-3 border-t border-dashed border-slate-200 space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Metode</span>
                            <span className="font-semibold text-slate-700">
                                {paymentLabel[sale.paymentMethod] || sale.paymentMethod}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Diterima</span>
                            <span className="font-semibold text-slate-700">
                                {formatCurrency(Number(sale.paidAmount))}
                            </span>
                        </div>
                        {change > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Kembalian</span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(change)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center py-4 border-t border-dashed border-slate-200">
                        <p className="text-[10px] text-slate-400 font-medium">
                            Terima kasih atas kunjungan Anda
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            ~ BUMAS Ansor ~
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-white border-t border-slate-100 px-5 py-4 flex gap-3 print:hidden">
                <button
                    onClick={handleShare}
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm"
                >
                    <Share2 size={16} />
                    Bagikan
                </button>
                <button
                    onClick={handlePrint}
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm"
                >
                    <Printer size={16} />
                    Cetak
                </button>
                <button
                    onClick={() => router.push("/pos")}
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/20"
                >
                    <Receipt size={16} />
                    POS Baru
                </button>
            </div>
        </div>
    );
}
