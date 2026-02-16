"use client";

import {
    Settings,
    ArrowLeft,
    ChevronRight,
    Store,
    CreditCard,
    Receipt,
    Printer,
    Percent,
    Bell,
    HelpCircle,
    Info,
    Cpu
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
    const router = useRouter();

    const sections = [
        {
            title: "Pengaturan Utama",
            items: [
                { label: "Informasi Usaha", icon: Store, href: "/settings/business", description: "Nama, alamat, dan kontak outlet" },
                { label: "Pajak & Biaya", icon: Percent, href: "/settings/tax", description: "Atur pajak global dan biaya layanan" },
                { label: "Metode Pembayaran", icon: CreditCard, href: "/settings/payment", description: "Kelola kas, bank, dan QRIS" },
            ]
        },
        {
            title: "Operasional",
            items: [
                { label: "Struk & Tampilan", icon: Receipt, href: "/settings/receipt", description: "Header, footer, dan logo struk" },
                { label: "Printer & Perangkat", icon: Printer, href: "/settings/devices", description: "Cek koneksi printer bluetooth" },
                { label: "Manajemen Stok", icon: Cpu, href: "/settings/inventory", description: "Atur ambang stok rendah" },
            ]
        },
        {
            title: "Lainnya",
            items: [
                { label: "Notifikasi", icon: Bell, href: "/settings/notifications", description: "Pesan WhatsApp dan pengingat" },
                { label: "Pusat Bantuan", icon: HelpCircle, href: "/settings/help" },
                { label: "Tentang BUMAS", icon: Info, href: "/settings/about" },
            ]
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100 sticky top-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Pengaturan</h1>
            </div>

            <div className="flex-1 pb-10">
                {sections.map((section, sidx) => (
                    <div key={sidx} className="mt-6">
                        <h2 className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            {section.title}
                        </h2>
                        <div className="bg-white border-y border-slate-100 divide-y divide-slate-50">
                            {section.items.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="flex items-center gap-4 px-6 py-4 active:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-800">{item.label}</h3>
                                        {item.description && (
                                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.description}</p>
                                        )}
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Account Section */}
                <div className="mt-8 px-6">
                    <button className="w-full h-14 bg-white rounded-2xl border border-red-100 text-red-500 font-bold flex items-center justify-center gap-2 active:bg-red-50 transition-colors">
                        Simpan Semua Pengaturan
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                        Perubahan akan diterapkan secara otomatis di semua perangkat yang terhubung.
                    </p>
                </div>
            </div>
        </div>
    );
}
