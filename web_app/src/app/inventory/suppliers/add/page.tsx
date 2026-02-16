"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Building, User, Phone, Mail, MapPin, FileEdit } from "lucide-react";

export default function AddSupplierPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        companyName: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle save logic here
        router.back();
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24 font-sans">
            {/* Header */}
            <div className="bg-white flex items-center justify-between px-5 py-4 sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-600">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="font-bold text-xl text-slate-800">Tambah Supplier</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 px-5 pt-8 space-y-6">
                {/* Form Fields */}
                <div className="space-y-5">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Building size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Nama Perusahaan / Supplier"
                            required
                            className="w-full h-14 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Nama Kontak (Person)"
                            className="w-full h-14 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium"
                            value={formData.contactName}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Phone size={20} />
                        </div>
                        <input
                            type="tel"
                            placeholder="Nomor Telepon"
                            required
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
                            placeholder="Alamat Email"
                            className="w-full h-14 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative items-start flex">
                        <div className="absolute left-4 top-4 text-slate-400">
                            <MapPin size={20} />
                        </div>
                        <textarea
                            placeholder="Alamat Lengkap"
                            rows={3}
                            className="w-full p-4 pl-12 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium resize-none"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="relative items-start flex">
                        <div className="absolute left-4 top-4 text-slate-400">
                            <FileEdit size={20} />
                        </div>
                        <textarea
                            placeholder="Catatan Internal"
                            rows={2}
                            className="w-full p-4 pl-12 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-red-500 outline-none transition-all font-medium resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 z-20">
                    <button
                        type="submit"
                        className="w-full h-14 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Simpan Supplier
                    </button>
                </div>
            </form>
        </div>
    );
}
