"use client";

import { useAuthStore } from "@/store/authStore";
import {
    X,
    Home,
    ShoppingBag,
    History,
    FileText,
    Users,
    Store,
    Settings,
    LogOut,
    ChevronRight,
    Smartphone,
    Globe,
    Clock,
    DollarSign,
    Bell,
    Box,
    Package,
    Crown,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();

    const menuItems: { label: string; icon: any; href: string; group: string; badge?: string; badgeColor?: string }[] = [
        { label: "Beranda", icon: Home, href: "/dashboard", group: "main" },
        { label: "Laporan", icon: FileText, href: "/reports", group: "main" },
        { label: "Riwayat Transaksi", icon: History, href: "/pos/history", group: "main" },
        { label: "Pembayaran", icon: CreditCard, href: "/pos/payments", group: "main" },
        { label: "Produk", icon: Box, href: "/products", group: "main" },
        { label: "Pengingat", icon: Bell, href: "/reminders", group: "main" },
        { label: "Pegawai", icon: Users, href: "/employees", group: "main" },
        { label: "Inventaris", icon: Package, href: "/inventory", group: "main" },
        { label: "Outlet", icon: Store, href: "/outlets", group: "main" },
        { label: "Kelola Kas", icon: DollarSign, href: "/cash-recap", group: "main" },
        { label: "Pelanggan", icon: Users, href: "/pos/customers", group: "main" },
        { label: "Website Usaha", icon: Globe, href: "/website", group: "main" },
        { label: "Integrasi", icon: Box, href: "/integrations", group: "main" },
        { label: "Pengaturan", icon: Settings, href: "/settings", group: "main" },
    ];

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Drawer */}
            <div
                className={`fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Profile Section */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Atur Profil</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-16 h-16 rounded-full border-2 border-red-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden relative">
                                <Image
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                FREE
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-lg">{user?.name || "User"}</h3>
                            <p className="text-sm text-slate-500">{user?.role || "Owner"}</p>
                        </div>
                        <ChevronRight className="text-slate-400" size={20} />
                    </div>

                    {/* Outlet Selector */}
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-0.5">Outlet Aktif</p>
                            <p className="font-bold text-slate-800 text-sm">Pusat</p>
                        </div>
                        <button className="text-red-500 text-sm font-bold">Ganti</button>
                    </div>
                </div>

                {/* Upgrade Banner */}
                <div className="px-5 py-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Crown size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-green-800">Upgrade ke Pro</p>
                            <p className="text-[10px] text-green-600 leading-tight">Dapatkan fitur lengkap untuk bisnismu</p>
                        </div>
                        <ChevronRight className="text-green-600" size={16} />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-2">
                    <div className="px-5">
                        {menuItems.map((item, index) => {
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center gap-4 py-3 group relative ${isActive ? 'text-red-500' : 'text-slate-700 hover:text-red-500'}`}
                                >
                                    {isActive && (
                                        <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />
                                    )}
                                    <item.icon size={20} className={isActive ? 'text-red-500' : 'text-slate-400 group-hover:text-red-500 transition-colors'} />
                                    <span className="font-medium flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 text-slate-500 hover:text-red-500 w-full font-medium transition-colors"
                    >
                        <LogOut size={20} />
                        Keluar
                    </button>
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-slate-400">Versi 1.0.0 • BUMAS Ansor</p>
                    </div>
                </div>
            </div>
        </>
    );
}
