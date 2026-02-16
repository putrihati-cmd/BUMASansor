"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Calendar } from "lucide-react";

export default function AddCustomerPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        ktp: "",
        birthDate: "",
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
        <div className="flex flex-col min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="bg-white flex items-center justify-between px-5 py-4 sticky top-0 z-20 border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-600">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="font-bold text-xl text-slate-800">Tambah Pelanggan</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 px-5 pt-8 space-y-6">
                {/* Profile Photo */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <Camera size={40} />
                        </div>
                        <button
                            type="button"
                            className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md text-slate-500"
                        >
                            <PlusIcon size={16} />
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    <div className="space-y-1">
                        <input
                            type="text"
                            placeholder="Nama Pelanggan"
                            required
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <input
                            type="tel"
                            placeholder="No Handphone"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <input
                            type="text"
                            placeholder="Nomor KTP"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.ktp}
                            onChange={(e) => setFormData({ ...formData, ktp: e.target.value })}
                        />
                    </div>

                    <div className="relative space-y-1">
                        <input
                            type="text"
                            placeholder="Tanggal Lahir"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.birthDate}
                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        />
                        <Calendar className="absolute right-4 top-4 text-slate-400" size={20} />
                    </div>

                    <div className="space-y-1">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <textarea
                            placeholder="Alamat"
                            rows={3}
                            className="w-full p-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all resize-none"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <textarea
                            placeholder="Catatan"
                            rows={2}
                            className="w-full p-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-50 z-20">
                    <button
                        type="submit"
                        className="w-full h-14 bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                    >
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
}

function PlusIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
