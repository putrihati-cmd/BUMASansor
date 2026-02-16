"use client";

import { useState } from "react";
import { X, Check, Plus, Minus } from "lucide-react";

interface ModifierModalProps {
    open: boolean;
    onClose: () => void;
    product: any;
    onConfirm: (selectedModifiers: any[]) => void;
}

export default function ModifierModal({ open, onClose, product, onConfirm }: ModifierModalProps) {
    const [selectedMods, setSelectedMods] = useState<any[]>([]);

    if (!open || !product) return null;

    const modifierGroups = product.modifierGroups || [];

    const toggleModifier = (group: any, mod: any) => {
        const isSelected = selectedMods.some(m => m.id === mod.id);

        if (isSelected) {
            setSelectedMods(selectedMods.filter(m => m.id !== mod.id));
        } else {
            // Check maxSelect for the group
            const groupSelectionCount = selectedMods.filter(m =>
                group.modifierGroup.modifiers.some((gm: any) => gm.id === m.id)
            ).length;

            if (group.modifierGroup.maxSelect === 1) {
                // Radio behavior: remove others from this group
                const otherGroupsMods = selectedMods.filter(m =>
                    !group.modifierGroup.modifiers.some((gm: any) => gm.id === m.id)
                );
                setSelectedMods([...otherGroupsMods, mod]);
            } else if (groupSelectionCount < group.modifierGroup.maxSelect) {
                setSelectedMods([...selectedMods, mod]);
            }
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedMods);
        onClose();
        setSelectedMods([]);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Opsi Tambahan</h3>
                        <p className="text-sm text-slate-500 font-medium">{product.product.name}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {modifierGroups.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">Tidak ada opsi tambahan.</p>
                    ) : (
                        modifierGroups.map((groupWrap: any) => {
                            const group = groupWrap.modifierGroup;
                            return (
                                <div key={group.id} className="mb-6 last:mb-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            {group.name}
                                            {group.isRequired && (
                                                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib</span>
                                            )}
                                        </h4>
                                        <span className="text-xs text-slate-400 font-medium">
                                            Pilih (Maks {group.maxSelect})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {group.modifiers.map((mod: any) => {
                                            const isSelected = selectedMods.some(m => m.id === mod.id);
                                            return (
                                                <button
                                                    key={mod.id}
                                                    onClick={() => toggleModifier(groupWrap, mod)}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected
                                                            ? "border-primary bg-primary/5 text-primary"
                                                            : "border-slate-100 hover:border-slate-200 text-slate-600"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-slate-300"
                                                            }`}>
                                                            {isSelected && <Check size={14} className="text-white" />}
                                                        </div>
                                                        <span className="font-semibold">{mod.name}</span>
                                                    </div>
                                                    <span className="text-sm font-bold">
                                                        +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(mod.price))}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <button
                        onClick={handleConfirm}
                        className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    );
}
