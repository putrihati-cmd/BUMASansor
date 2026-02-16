"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Search,
    Plus,
    User,
    ShieldCheck,
    Clock,
    ChevronRight,
    MoreVertical
} from "lucide-react";
import Image from "next/image";

export default function EmployeesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const employees = [
        { id: '1', name: 'Andi Pratama', role: 'Kasir Utama', status: 'SHIFT AKTIF', lastActive: 'Sekarang' },
        { id: '2', name: 'Siti Aminah', role: 'Staff Gudang', status: 'OFF', lastActive: 'Kemarin, 17:00' },
        { id: '3', name: 'Budi Santoso', role: 'Owner', status: 'MASUK', lastActive: 'Hari ini, 08:00' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center justify-between px-5 py-4 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-slate-800">Manajemen Pegawai</h1>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white px-5 pb-4 border-b border-slate-50">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Nama atau peran pegawai..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl outline-none font-medium text-slate-700 text-sm focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 p-5 space-y-4">
                {/* Employee Cards */}
                <div className="space-y-3">
                    {employees.map((emp) => (
                        <div key={emp.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden relative border-2 border-white shadow-sm font-black text-slate-300 flex items-center justify-center text-xl">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${emp.status === 'OFF' ? 'bg-slate-300' : 'bg-green-500'} flex items-center justify-center`}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{emp.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{emp.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[9px] font-black text-slate-300 mb-0.5 uppercase tracking-tighter">Terakhir Aktif</p>
                                    <p className="text-[10px] font-bold text-slate-500">{emp.lastActive}</p>
                                </div>
                                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Team Info */}
                <div className="mt-8 bg-white border border-slate-100 rounded-[32px] p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">Keamanan & Peran</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Batas akses pegawai berdasarkan peran untuk menjaga keamanan data finansial outlet kamu. Gunakan PIN 6 digit unik untuk setiap pegawai.</p>
                    <button className="w-full h-11 bg-slate-50 text-slate-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-2">
                        Atur Hak Akses
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* FAB */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={() => router.push("/employees/add")}
                    className="w-16 h-16 bg-red-600 text-white rounded-[24px] shadow-xl shadow-red-200 flex items-center justify-center active:scale-90 transition-all"
                >
                    <Plus size={32} />
                </button>
            </div>
        </div>
    );
}
