"use client";

import { useAuthStore } from "@/store/authStore";
import { LogOut, User, Users, Lock, Unlock, CreditCard, Menu } from "lucide-react";
import { Button } from "../ui/Button";
import { useShiftStore } from "@/store/shiftStore";
import Link from "next/link";

interface HeaderProps {
    onOpenSidebar?: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
    const { user, logout } = useAuthStore();
    const { currentShift } = useShiftStore();

    return (
        <header className="glass sticky top-0 z-[40] flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
                {onOpenSidebar && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onOpenSidebar}
                        className="mr-1 text-slate-700 hover:bg-slate-100 rounded-xl"
                    >
                        <Menu size={24} />
                    </Button>
                )}
                <Link href="/pos/shift" className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-colors">
                        <User size={20} />
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${currentShift ? 'bg-green-500' : 'bg-red-500'}`} />
                </Link>
                <div>
                    <h1 className="text-sm font-bold text-slate-900 leading-tight">
                        {user?.name || "Kasir"}
                    </h1>
                    <Link href="/pos/attendance" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-primary transition-colors">
                        <Users size={10} />
                        Absensi
                    </Link>
                    <Link href="/pos/shift" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-primary transition-colors">
                        {currentShift ? <Unlock size={10} className="text-green-500" /> : <Lock size={10} className="text-red-500" />}
                        {currentShift ? 'Shift Aktif' : 'Shift Tutup'}
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Link href="/pos/customers">
                    <Button variant="ghost" size="icon" className="text-slate-500 rounded-xl hover:bg-slate-100">
                        <Users size={18} />
                    </Button>
                </Link>
                <Link href="/pos/debts">
                    <Button variant="ghost" size="icon" className="text-slate-500 rounded-xl hover:bg-slate-100">
                        <CreditCard size={18} />
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                >
                    <LogOut size={18} />
                </Button>
            </div>
        </header>
    );
}
