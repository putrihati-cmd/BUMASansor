"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/pos/Sidebar";
import Header from "@/components/pos/Header";
import ProductCard from "@/components/pos/ProductCard";
import CartBar from "@/components/pos/CartBar";
import CartSheet from "@/components/pos/CartSheet";
import ModifierModal from "@/components/pos/modals/ModifierModal";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWarungProducts } from "@/hooks/useWarungProducts";
import { Search, Loader2, ClipboardList, ClipboardCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function POSPage() {
    const { user } = useAuthStore();
    const { addItem } = useCartStore();
    const { data: products, isLoading, error } = useWarungProducts(user?.warungId);
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [cartOpen, setCartOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Modifier state
    const [modifierModalOpen, setModifierModalOpen] = useState(false);
    const [activeProduct, setActiveProduct] = useState<any>(null);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((p: any) =>
            p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const handleAddProduct = (wp: any) => {
        if (wp.modifierGroups && wp.modifierGroups.length > 0) {
            setActiveProduct(wp);
            setModifierModalOpen(true);
        } else {
            addItem(wp);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50/50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

            {/* Search Section */}
            <div className="px-5 py-4 flex gap-3">
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama produk atau scan barcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white border-2 border-slate-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm font-semibold text-slate-700"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push("/pos/stock-opname")}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 text-slate-500 hover:border-primary/20 hover:text-primary transition-all shadow-sm group"
                        title="Stock Opname"
                    >
                        <ClipboardCheck size={22} className="group-active:scale-90 transition-transform" />
                    </button>
                    <button
                        onClick={() => router.push("/pos/history")}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 text-slate-500 hover:border-primary/20 hover:text-primary transition-all shadow-sm group"
                        title="Riwayat"
                    >
                        <ClipboardList size={22} className="group-active:scale-90 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <div className="relative">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <Sparkles className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" size={16} />
                        </div>
                        <p className="text-sm font-bold mt-4 tracking-wide uppercase text-slate-500">Menyinkronkan Katalog...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-500 text-center bg-red-50 rounded-3xl p-6 border-2 border-red-100">
                        <p className="font-black text-lg">Gagal Memuat Katalog!</p>
                        <p className="text-sm mt-1 font-medium opcaity-80 text-red-400">Pastikan Anda terhubung ke internet dan sudah masuk sebagai Warung.</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            {searchQuery ? "Produk tidak ditemukan" : "Katalog masih kosong"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((wp: any) => (
                            <ProductCard
                                key={wp.id}
                                product={wp}
                                onAdd={() => handleAddProduct(wp)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CartBar onClick={() => setCartOpen(true)} />
            <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />

            <ModifierModal
                open={modifierModalOpen}
                product={activeProduct}
                onClose={() => setModifierModalOpen(false)}
                onConfirm={(selectedMods) => addItem(activeProduct, selectedMods)}
            />
        </div>
    );
}
