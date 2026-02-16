"use client";

import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Users,
    ShoppingCart,
    MoveHorizontal,
    SlidersHorizontal,
    History,
    Crown
} from "lucide-react";

export default function InventoryPage() {
    const router = useRouter();

    const menuItems = [
        {
            title: "Ringkasan",
            description: "Lihat ringkasan nilai stok dan aset inventaris kamu.",
            icon: ClipboardList,
            href: "/inventory/summary",
            isPro: true
        },
        {
            title: "Supplier",
            description: "Kelola daftar pemasok barang untuk outlet kamu.",
            icon: Users,
            href: "/inventory/suppliers"
        },
        {
            title: "Pembelian",
            description: "Catat riwayat pembelian stok barang dari supplier.",
            icon: ShoppingCart,
            href: "/inventory/purchases"
        },
        {
            title: "Pemindahan Stok",
            description: "Catat perpindahan stok barang antar outlet.",
            icon: MoveHorizontal,
            href: "/inventory/transfer"
        },
        {
            title: "Penyesuaian Stok",
            description: "Perbarui jumlah stok barang karena rusak atau hilang.",
            icon: SlidersHorizontal,
            href: "/inventory/adjustment"
        },
        {
            title: "Perputaran Stok",
            description: "Lihat laporan masuk dan keluarnya stok barang secara detail.",
            icon: History,
            href: "/inventory/movement",
            isPro: true
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                >
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-xl text-slate-800">Inventaris</h1>
            </div>

            {/* Menu List */}
            <div className="flex-1 p-5 space-y-4">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => router.push(item.href)}
                        className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left hover:border-red-100 hover:shadow-md transition-all group relative overflow-hidden"
                    >
                        <div className={`p-3 rounded-xl ${item.isPro ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
                            <item.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-800 group-hover:text-red-500 transition-colors text-base">
                                    {item.title}
                                </h3>
                                {item.isPro && (
                                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Crown size={10} />
                                        PRO
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" size={20} />
                    </button>
                ))}
            </div>

            {/* Promo Banner */}
            <div className="p-5">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-red-200 flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-bold opacity-90 mb-1">Maksimalkan Manajemen Stok</p>
                        <p className="text-xs font-medium opacity-80 leading-relaxed">Berlangganan BUMAS Pro untuk fitur analisis inventaris lebih lanjut.</p>
                    </div>
                    <button className="bg-white text-red-600 font-bold text-xs px-4 py-2 rounded-full ml-4 whitespace-nowrap">
                        Pelajari Lanjut
                    </button>
                </div>
            </div>
        </div>
    );
}
