"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Eye, HelpCircle } from "lucide-react";

export default function AddEmployeePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        position: "",
        email: "",
        pin: "",
        role: "operator", // Default role
    });

    const [showPin, setShowPin] = useState(false);

    const roles = [
        { id: "supervisor", label: "Supervisor" },
        { id: "operator", label: "Operator" },
        { id: "non-operator", label: "Non-Operator" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle save logic here
        router.back();
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="bg-white flex items-center gap-4 px-5 py-4 sticky top-0 z-20 border-b border-slate-50">
                <button
                    onClick={() => router.back()}
                    className="text-slate-600"
                >
                    <ChevronLeft size={28} />
                </button>
                <h1 className="font-bold text-xl text-slate-800 flex-1 text-center pr-8">Tambah Pegawai</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 px-5 pt-8 space-y-6">
                {/* Profile Photo */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-2xl">
                            NP
                        </div>
                        <button
                            type="button"
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md text-slate-500"
                        >
                            <Camera size={20} />
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <input
                            type="text"
                            placeholder="Nama Pegawai"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <input
                            type="tel"
                            placeholder="No. Handphone"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 px-1">Input kode negara dahulu, Ex: 6211122224444</p>
                    </div>

                    <div className="space-y-1.5">
                        <input
                            type="text"
                            placeholder="Jabatan"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <input
                            type="email"
                            placeholder="Alamat Email"
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative space-y-1.5">
                        <input
                            type={showPin ? "text" : "password"}
                            placeholder="PIN 6 Angka"
                            maxLength={6}
                            className="w-full h-14 px-4 bg-white rounded-lg border border-slate-200 focus:border-red-500 outline-none transition-all"
                            value={formData.pin}
                            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-4 top-4 text-slate-400"
                        >
                            <Eye size={20} />
                        </button>
                    </div>
                </div>

                {/* Roles Selection */}
                <div className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-bold text-slate-800">Hak Akses</h3>
                        <HelpCircle size={18} className="text-slate-400" />
                    </div>
                    <div className="space-y-0 text-slate-800">
                        {roles.map((role) => (
                            <label
                                key={role.id}
                                className="flex items-center justify-between py-4 border-b border-slate-50 cursor-pointer"
                            >
                                <span className="text-base">{role.label}</span>
                                <input
                                    type="radio"
                                    name="role"
                                    value={role.id}
                                    checked={formData.role === role.id}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-6 h-6 border-slate-300 text-red-500 focus:ring-red-500"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Outlet Selection */}
                <div className="flex items-center justify-between py-6">
                    <span className="font-bold text-slate-800">Outlet</span>
                    <button
                        type="button"
                        className="px-6 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                    >
                        Pilih Outlet
                    </button>
                </div>
                <p className="text-xs text-slate-400 -mt-4 mb-8">Tekan Pilih Outlet untuk memilih tempat pegawai bekerja</p>

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
