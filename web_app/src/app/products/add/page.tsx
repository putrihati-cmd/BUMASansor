"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Camera,
    Image as ImageIcon,
    Save,
    Trash2,
    Crown,
    AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AddProductPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        costPrice: "",
        stock: "",
        sku: "",
        categoryId: "",
        brandId: "",
        isFavorite: false,
        trackStock: true,
        hasWholesale: false
    });

    const [showCostPrice, setShowCostPrice] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (key: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key as keyof typeof formData] }));
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center gap-4 px-5 py-4 sticky top-0 z-20 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-lg text-slate-800">Tambah Produk</h1>
            </div>

            <div className="p-5 max-w-lg mx-auto space-y-6">

                {/* Image Upload */}
                <div className="flex justify-center py-4">
                    <button className="w-32 h-32 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all group relative overflow-hidden">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Foto Produk</span>
                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                    </button>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Nama Produk</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contoh: Kopi Susu Gula Aren"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                        />
                    </div>

                    <div className="relative group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Harga Jual</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Selectors */}
                <div className="space-y-3">
                    <button className="w-full h-14 bg-white px-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-red-400 transition-colors group">
                        <div className="text-left">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5 group-hover:text-red-400 transition-colors">Merek</span>
                            <span className="font-medium text-slate-800">Pilih Merek</span>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-red-400 transition-colors" size={20} />
                    </button>

                    <button className="w-full h-14 bg-white px-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-red-400 transition-colors group">
                        <div className="text-left">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5 group-hover:text-red-400 transition-colors">Kategori</span>
                            <span className="font-medium text-slate-800">Pilih Kategori</span>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-red-400 transition-colors" size={20} />
                    </button>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                    {/* Favorite Toggle */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-800 text-sm">Produk Favorit</h3>
                                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">BARU</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">Tampilkan produk di kategori terdepan pada POS.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={formData.isFavorite} onChange={() => handleToggle('isFavorite')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                    </div>

                    {/* Cost Price Toggle */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-sm">Atur Harga Modal & Barcode</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={showCostPrice} onChange={() => setShowCostPrice(!showCostPrice)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                        </div>

                        {showCostPrice && (
                            <div className="mt-4 space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
                                <div className="relative group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Harga Modal</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                        <input
                                            type="number"
                                            name="costPrice"
                                            value={formData.costPrice}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold text-slate-800"
                                        />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Barcode / SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder="Scan atau ketik manual"
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stock Management */}
                <button
                    onClick={() => router.push('/products/stock')}
                    className="w-full bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-red-400 transition-colors group"
                >
                    <div className="text-left">
                        <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-500 transition-colors">Kelola Stok</h3>
                        <p className="text-xs text-slate-500">Stok saat ini: <span className="font-bold text-slate-700">Tidak Terbatas</span></p>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-colors" size={20} />
                </button>

                {/* Wholesale (PRO) */}
                <div className="bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-xl p-4 relative overflow-hidden group hover:border-orange-300 transition-colors cursor-pointer">
                    <div className="absolute top-0 right-0 p-2 opacity-50 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Crown size={64} className="text-orange-200" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-orange-900 text-sm">Atur Harga Grosir</h3>
                                <Crown size={14} className="text-orange-500 fill-orange-500" />
                            </div>
                            <p className="text-xs text-orange-700/80 leading-relaxed max-w-[240px]">
                                Kamu akan lebih leluasa mengatur harga grosir sesuai keinginanmu.
                            </p>
                        </div>
                        <ChevronRight className="text-orange-300 group-hover:text-orange-500 transition-colors" size={20} />
                    </div>
                </div>

                {/* Add Variant Button */}
                <button className="w-full h-12 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Tambah Varian
                </button>

                {/* Delete Product (Disabled for new) */}
                <button className="w-full flex items-center justify-center gap-2 text-slate-300 font-bold py-2 cursor-not-allowed">
                    <Trash2 size={18} />
                    Hapus Produk
                </button>

            </div>

            {/* Sticky Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 z-20 md:max-w-md md:mx-auto">
                <button
                    onClick={() => console.log('Simpan', formData)}
                    className="w-full h-14 bg-red-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    Simpan
                </button>
            </div>
        </div>
    );
}

function Plus({ size = 24, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
