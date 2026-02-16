"use client";

import { useState } from "react";
import Header from "@/components/pos/Header";
import {
    Tag,
    Layers,
    Settings,
    Users,
    ChefHat,
    ChevronRight,
    ArrowLeft,
    Box,
    Plus,
    Percent
} from "lucide-react";
import { useRouter } from "next/navigation";

const MENU_ITEMS = [
    {
        title: "Atur Stok",
        description: "Kelola kuantitas produk Anda",
        icon: Box,
        color: "bg-blue-50 text-blue-500",
        path: "/pos/stock-opname"
    },
    {
        title: "Opsi Tambahan (Modifier)",
        description: "Topping, Level pedas, Ukuran, dll",
        icon: Plus,
        color: "bg-purple-50 text-purple-500",
        path: "/pos/catalog/modifiers"
    },
    {
        title: "Harga Grosir",
        description: "Atur harga bertingkat untuk pembelian banyak",
        icon: Tag,
        color: "bg-green-50 text-green-500",
        path: "/pos/catalog/wholesale"
    },
    {
        title: "Bundel Produk",
        description: "Jual paket produk dengan harga khusus",
        icon: Layers,
        color: "bg-orange-50 text-orange-500",
        path: "/pos/catalog/bundles"
    },
    {
        title: "Bahan Baku & Resep",
        description: "Otomatis kurangi stok bahan saat produk terjual",
        icon: ChefHat,
        color: "bg-rose-50 text-rose-500",
        path: "/pos/catalog/ingredients"
    },
    {
        title: "Pajak & Biaya Layanan",
        description: "Atur PPN dan service charge warung",
        icon: Percent,
        color: "bg-indigo-50 text-indigo-500",
        path: "/pos/catalog/tax-settings"
    }
];

export default function CatalogHub() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <Header />

            {/* Back Bar */}
            <div className="px-5 py-4 flex items-center gap-4 bg-white border-b border-slate-100">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Kelola Katalog Pro</h1>
            </div>

            {/* Grid Menu */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                    {MENU_ITEMS.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => router.push(item.path)}
                            className="flex items-center gap-4 p-5 bg-white rounded-3xl border-2 border-slate-50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group text-left"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
                                <item.icon size={26} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.title}</h3>
                                <p className="text-sm text-slate-500 font-medium mt-0.5">{item.description}</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-primary/5 rounded-3xl border-2 border-primary/10">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center flex-shrink-0">
                            <Settings size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-primary">Tips BUMAS Ansor</h4>
                            <p className="text-sm text-primary/70 font-medium mt-1 leading-relaxed">
                                Gunakan fitur <b>Bahan Baku</b> untuk melacak stok barang yang diolah sendiri (seperti Es Teh atau Bakso) agar keuntungan Anda lebih akurat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
