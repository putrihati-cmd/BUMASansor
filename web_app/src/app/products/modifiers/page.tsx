"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Layers,
    ListChecks,
    CheckSquare,
    MoreVertical
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function ModifiersPage() {
    const router = useRouter();

    // Mock Data
    const [modifierGroups, setModifierGroups] = useState([
        {
            id: '1',
            name: 'Level Pedas',
            type: 'SINGLE', // Radio
            required: true,
            options: [
                { name: 'Level 1', price: 0 },
                { name: 'Level 2', price: 0 },
                { name: 'Level 3', price: 2000 },
                { name: 'Level 4', price: 3000 },
                { name: 'Level 5', price: 5000 },
            ]
        },
        {
            id: '2',
            name: 'Topping Minuman',
            type: 'MULTIPLE', // Checkbox
            required: false,
            options: [
                { name: 'Boba', price: 3000 },
                { name: 'Jelly', price: 3000 },
                { name: 'Pudding', price: 4000 },
                { name: 'Cheese Foam', price: 5000 },
            ]
        },
        {
            id: '3',
            name: 'Ukuran Cup',
            type: 'SINGLE',
            required: true,
            options: [
                { name: 'Regular', price: 0 },
                { name: 'Large', price: 4000 },
            ]
        }
    ]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 flex items-center justify-between px-5 py-4 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800 leading-tight">Opsi Tambahan</h1>
                        <p className="text-xs text-slate-400">Atur varian produk</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24 p-5 space-y-4">
                {modifierGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Layers size={64} className="mb-4 text-slate-200" />
                        <h3 className="font-bold text-slate-600">Belum ada Opsi Tambahan</h3>
                        <p className="text-sm text-slate-400">Tambahkan opsi untuk produk kamu</p>
                    </div>
                ) : (
                    modifierGroups.map((group) => (
                        <div key={group.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-violet-100 transition-colors group cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${group.type === 'SINGLE' ? 'bg-orange-50 text-orange-500' : 'bg-violet-50 text-violet-500'}`}>
                                        {group.type === 'SINGLE' ? <ListChecks size={20} /> : <CheckSquare size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{group.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {group.type === 'SINGLE' ? 'Pilih Satu (Wajib)' : 'Pilih Banyak (Opsional)'}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-1 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-slate-500">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {group.options.slice(0, 4).map((opt, idx) => (
                                    <span key={idx} className="bg-slate-50 text-slate-600 text-xs px-2.5 py-1 rounded-lg border border-slate-100 font-medium">
                                        {opt.name}
                                    </span>
                                ))}
                                {group.options.length > 4 && (
                                    <span className="bg-slate-50 text-slate-400 text-xs px-2.5 py-1 rounded-lg border border-slate-100 font-medium">
                                        +{group.options.length - 4} lainnya
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB Add Button */}
            <div className="fixed bottom-6 right-6 z-20">
                <button
                    onClick={() => console.log('Add Modifier')}
                    className="w-14 h-14 bg-violet-600 rounded-full shadow-xl shadow-violet-500/30 flex items-center justify-center text-white hover:bg-violet-700 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={32} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
