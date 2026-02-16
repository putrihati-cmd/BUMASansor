"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Plus, Package } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
    product: any;
    onAdd: () => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
    const isOutOfStock = product.stockQty <= 0;

    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={!isOutOfStock ? onAdd : undefined}
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl bg-white p-3 shadow-sm transition-all hover:shadow-md cursor-pointer",
                isOutOfStock && "opacity-60 cursor-not-allowed"
            )}
        >
            <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl bg-slate-50">
                {product.modifierGroups?.length > 0 && (
                    <div className="absolute left-2 top-2 z-10 rounded-full bg-purple-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-white shadow-sm ring-2 ring-white">
                        + Opsi
                    </div>
                )}
                <div className="flex h-full w-full items-center justify-center text-slate-200">
                    {product.product.imageUrl ? (
                        <img
                            src={product.product.imageUrl}
                            alt={product.product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                    ) : (
                        <Package size={40} strokeWidth={1.5} />
                    )}
                </div>

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                            Stok Habis
                        </span>
                    </div>
                )}

                <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm">
                    Stok: {product.stockQty}
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <h3 className="line-clamp-2 text-xs font-semibold text-slate-800">
                        {product.product.name}
                    </h3>
                    <p className="mt-1 text-[10px] font-medium text-slate-400">
                        {product.product.barcode}
                    </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(Number(product.sellingPrice))}
                    </span>
                    <button
                        onClick={onAdd}
                        disabled={isOutOfStock}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-all active:scale-90 disabled:bg-slate-200"
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
