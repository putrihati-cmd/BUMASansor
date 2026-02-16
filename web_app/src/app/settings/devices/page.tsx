"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Printer,
    Bluetooth,
    Search,
    RefreshCw,
    Settings,
    Play,
    CheckCircle2
} from "lucide-react";

export default function DeviceSettingsPage() {
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);

    const scanDevices = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 3000);
    };

    const connectedDevices = [
        { name: "RPP02N (Thermal)", address: "86:13:B5:44:A2:01", status: "CONNECTED" },
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
                    <h1 className="font-bold text-lg text-slate-800">Printer & Perangkat</h1>
                </div>
                <button
                    onClick={scanDevices}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 ${isScanning ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="flex-1 p-5 space-y-8">
                {/* Status Card */}
                <div className="bg-white rounded-[40px] p-6 border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shrink-0">
                        <Printer size={32} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg">1 Printer Terhubung</h3>
                        <p className="text-xs text-slate-400 font-medium">Siap mencetak transaksi & struk.</p>
                    </div>
                </div>

                {/* Connected Devices */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Perangkat Terhubung</h3>
                    <div className="space-y-3">
                        {connectedDevices.map((dev, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                                        <Bluetooth size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{dev.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">{dev.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="h-10 px-4 bg-slate-50 text-slate-600 font-bold text-[10px] rounded-xl uppercase tracking-wider active:bg-slate-100 transition-colors">Test Print</button>
                                    <CheckCircle2 size={20} className="text-green-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scan Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                        Cari Perangkat Baru
                        <span className="flex items-center gap-1.5 text-blue-500">
                            {isScanning && <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />}
                            {isScanning ? 'SCANNIG...' : ''}
                        </span>
                    </h3>
                    <div className="bg-slate-100/50 rounded-[32px] p-10 flex flex-col items-center text-center gap-4 border border-dashed border-slate-200">
                        <Bluetooth size={48} className={`text-slate-200 ${isScanning ? 'animate-pulse' : ''}`} />
                        <div>
                            <p className="text-xs font-bold text-slate-500">Pastikan Bluetooth Printer menyala dan dalam mode 'Discovery'.</p>
                        </div>
                        {!isScanning && (
                            <button
                                onClick={scanDevices}
                                className="mt-2 h-12 bg-white border border-slate-200 text-slate-700 font-bold px-8 rounded-2xl shadow-sm active:scale-[0.96] transition-all"
                            >
                                Cari Bluetooth
                            </button>
                        )}
                    </div>
                </div>

                {/* Other Peripherals */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Perangkat Lain</h3>
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 flex items-center justify-between shadow-sm grayscale opacity-60">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Cash Drawer</h4>
                                <p className="text-[10px] text-slate-400">Hubungkan laci kasir otomatis</p>
                            </div>
                        </div>
                        <Play size={16} className="text-slate-300" />
                    </div>
                </div>
            </div>
        </div>
    );
}
