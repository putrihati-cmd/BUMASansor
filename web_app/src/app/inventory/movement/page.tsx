"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    Calendar,
    ArrowRightLeft,
    Package,
    ArrowUpDown,
    History
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function StockMovementPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");

    // Mock data for stock movements
    const movements = [
        {
            id: '1',
            productName: 'Kopi Kenangan Mantan',
            sku: 'KKM-001',
            type: 'SALE', // Penjualan
            change: -2,
            stockAfter: 48,
            timestamp: 'Hari ini, 15:30',
            source: 'Transaksi #POS-1002'
        },
        {
            id: '2',
            productName: 'Indomie Goreng Spesial',
            sku: 'IND-001',
            type: 'PURCHASE', // Pembelian
            change: 50,
            stockAfter: 124,
            timestamp: 'Hari ini, 14:00',
            source: 'Supplier: PT. Indofood'
        },
        {
            id: '3',
            productName: 'Susu UHT Ultra 250ml',
            sku: 'ULT-250',
            type: 'ADJUSTMENT', // Penyesuaian
            change: -1,
            stockAfter: 19,
            timestamp: 'Kemarin, 09:20',
            source: 'Alasan: Barang Rusak'
        },
        {
            id: '4',
            productName: 'Kopi Kenangan Mantan',
            sku: 'KKM-001',
            type: 'TRANSFER', // Mutasi
            change: -5,
            stockAfter: 50,
            timestamp: '12 Okt, 11:00',
            source: 'Ke: Outlet B (Dago)'
        }
    ];

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'SALE': return { label: 'Penjualan', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' };
            case 'PURCHASE': return { label: 'Pembelian', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' };
            case 'ADJUSTMENT': return { label: 'Penyesuaian', icon: History, color: 'text-orange-500', bg: 'bg-orange-50' };
            case 'TRANSFER': return { label: 'Mutasi Stok', icon: ArrowRightLeft, color: 'text-blue-500', bg: 'bg-blue-50' };
            default: return { label: 'Lainnya', icon: Package, color: 'text-slate-500', bg: 'bg-slate-50' };
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800 flex-1 text-center pr-8">Perputaran Stok</h1>
                </div>

                {/* Filters */}
                <div className="px-5 pb-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari produk atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm focus:border-red-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap shadow-sm">
                            <Calendar size={14} />
                            Semua Waktu
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap shadow-sm">
                            <Filter size={14} />
                            Semua Tipe
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap shadow-sm">
                            <ArrowUpDown size={14} />
                            Terbaru
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 space-y-4 pb-10">
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-50">
                        {movements.map((m) => {
                            const details = getTypeDetails(m.type);
                            return (
                                <div key={m.id} className="p-5 active:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${details.bg} ${details.color} flex items-center justify-center shrink-0`}>
                                                <details.icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">{m.productName}</h3>
                                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wider">SKU: {m.sku}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-black ${m.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {m.change > 0 ? `+${m.change}` : m.change}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Stok Akhir: <strong>{m.stockAfter}</strong></p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <span className={`${details.color}`}>{details.label}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span>{m.timestamp}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic max-w-[50%] truncate">{m.source}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Empty State placeholder if needed */}
                {movements.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <History size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-800 font-bold">Tidak ada riwayat stok</h3>
                        <p className="text-slate-400 text-xs mt-1">Lakukan transaksi atau penyesuaian stok untuk melihat data di sini.</p>
                    </div>
                )}
            </div>

            {/* Download/Export Button */}
            <div className="fixed bottom-6 right-6">
                <button className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center active:scale-95 transition-all">
                    <TrendingUp size={24} className="rotate-45" />
                </button>
            </div>
        </div>
    );
}
