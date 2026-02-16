"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Store,
    Phone,
    Mail,
    MapPin,
    Tag,
    Camera,
    Info
} from "lucide-react";

export default function AddOutletPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        category: "",
        address: "",
        notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.back();
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24 font-sans">
            {/* Header */}
            <div className="bg-white flex items-center gap-4 px-5 py-4 sticky top-0 z-20 border-b border-slate-50">
                <button onClick={() => router.back()} className="text-slate-600">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-xl text-slate-800">Tambah Outlet</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex-1">
                {/* Logo Section */}
                <div className="flex flex-col items-center py-8 bg-slate-50/50">
                    <div className="w-24 h-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 relative group cursor-pointer active:scale-95 transition-all">
                        <Camera size={32} />
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Logo</span>
                        <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                            <Plus size={14} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 font-medium italic">Resolusi terbaik 512x512px</p>
                </div>

                <div className="px-5 py-8 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Store size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Nama Outlet"
                                required
                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Tag size={20} />
                            </div>
                            <select
                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium appearance-none text-slate-600"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Pilih Kategori Bisnis</option>
                                <option value="kuliner">Kuliner (Makanan & Minuman)</option>
                                <option value="retail">Retail (Toko Kelontong)</option>
                                <option value="jasa">Jasa</option>
                                <option value="fashion">Fashion</option>
                            </select>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone size={20} />
                            </div>
                            <input
                                type="tel"
                                placeholder="Nomor Telepon Outlet"
                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Outlet"
                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="relative items-start flex">
                        <div className="absolute left-4 top-4 text-slate-400">
                            <MapPin size={20} />
                        </div>
                        <textarea
                            placeholder="Alamat Lengkap Outlet"
                            rows={3}
                            className="w-full p-4 pl-12 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium resize-none"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    {/* Pro Hint */}
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                        <Info size={20} className="text-orange-400 shrink-0" />
                        <p className="text-xs text-orange-700 leading-relaxed font-bold">
                            Hanya pemilik (Owner) yang dapat menambah dan menghapus outlet.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 z-20">
                    <button
                        type="submit"
                        className="w-full h-14 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                    >
                        Simpan Outlet
                    </button>
                </div>
            </form>
        </div>
    );
}

const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
