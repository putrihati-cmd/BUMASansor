"use client";

import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Box,
    Package,
    Layers,
    ChefHat,
    ShoppingBag
} from "lucide-react";

export default function ProductsPage() {
    const router = useRouter();

    const menuItems = [
        {
            title: "Produk",
            description: "Kelola semua produk untuk katalog toko kamu di sini.",
            icon: Box,
            href: "/products/list"
        },
        {
            title: "Atur Stok",
            description: "Ubah, tambah, atau kurangi stok produk dengan cepat.",
            icon: Package,
            href: "/products/stock"
        },
        {
            title: "Opsi Tambahan",
            description: "Atur opsi tambahan (modifiers) yang kamu butuhkan untuk produk.",
            icon: Layers,
            href: "/products/modifiers"
        },
        {
            title: "Bundel",
            description: "Kelola bundel kumpulan produk untuk katalog toko.",
            icon: ShoppingBag,
            href: "/products/bundles"
        },
        {
            title: "Bahan Baku & Resep",
            description: "Buat resep produk dari bahan baku.",
            icon: ChefHat,
            href: "/products/recipes"
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
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-lg text-slate-800">Kelola Produk</h1>
            </div>

            {/* Menu List */}
            <div className="flex-1 p-5 space-y-4">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => router.push(item.href)}
                        className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left hover:border-red-100 hover:shadow-md transition-all group"
                    >
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-red-500 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" size={20} />
                    </button>
                ))}
            </div>
        </div>
    );
}
