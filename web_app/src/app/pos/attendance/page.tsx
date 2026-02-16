"use client";

import { useState } from "react";

import {
    Clock,
    Camera,
    MapPin,
    CheckCircle2,
    LogOut,
    ArrowLeft,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AttendancePage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"OUT" | "IN">("OUT"); // Dummy state for demo

    const handleClockAction = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setStatus(status === "OUT" ? "IN" : "OUT");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">


            {/* Header Section */}
            <div className="px-6 py-6 bg-gradient-to-br from-primary to-primary-600 text-white rounded-b-[40px] shadow-lg shadow-primary/20">
                <button
                    onClick={() => router.back()}
                    className="mb-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black">Presensi Pegawai</h1>
                <p className="text-primary-100 font-medium mt-1">Halo, {user?.name || "Pegawai"}!</p>
            </div>

            {/* Main Action */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center -mt-8">
                <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
                    <div className="mb-6 relative">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${status === "IN" ? "bg-green-50 text-green-500 scale-110" : "bg-primary/5 text-primary"
                            }`}>
                            <Clock size={48} strokeWidth={2.5} className={isLoading ? "animate-pulse" : ""} />
                        </div>
                        {status === "IN" && (
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center border-4 border-white animate-in zoom-in">
                                <CheckCircle2 size={20} />
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">
                        {status === "IN" ? "Sudah Absen Masuk" : "Belum Absen Masuk"}
                    </h2>
                    <p className="text-slate-400 font-medium mt-2 mb-8">
                        {status === "IN"
                            ? "Anda sudah mulai bekerja sejak pukul 08:00 WIB"
                            : "Silakan tekan tombol di bawah untuk mulai bekerja hari ini."
                        }
                    </p>

                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-left">
                            <MapPin size={18} className="text-primary" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lokasi Terdeteksi</p>
                                <p className="text-sm font-bold text-slate-700">Warung Pusat, Bojongsoang</p>
                            </div>
                        </div>

                        <button
                            onClick={handleClockAction}
                            disabled={isLoading}
                            className={`w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${status === "IN"
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]"
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : status === "IN" ? (
                                <>
                                    <LogOut size={22} />
                                    Presensi Pulang
                                </>
                            ) : (
                                <>
                                    <Camera size={22} />
                                    Presensi Masuk
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-slate-400 text-sm font-medium">
                    Butuh bantuan? <span className="text-primary cursor-pointer hover:underline">Hubungi Admin</span>
                </p>
            </div>
        </div>
    );
}
