"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response: any = await api.post("/auth/login", { email, password });
            const { user, accessToken } = response.data;
            login(user, accessToken);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Gagal masuk. Periksa email dan password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/auth-bg.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            </div>

            {/* Decorative Elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-10 right-10 w-64 h-64 bg-primary rounded-full blur-[100px] z-0"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1.2 }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                className="absolute bottom-10 left-10 w-96 h-96 bg-primary-600 rounded-full blur-[120px] z-0"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[400px] px-6"
            >
                {/* Logo Section */}
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
                    >
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
                        BUMAS <span className="text-primary-400">Ansor</span>
                    </h1>
                    <p className="text-slate-200 font-medium tracking-wide">
                        Ecosystem POS & Distribusi Amanah
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass p-8 rounded-[2.5rem] shadow-2xl border border-white/30">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Akses</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 pl-12 pr-5 rounded-2xl bg-white/50 border border-slate-200/50 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                                    placeholder="admin@bumas.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Kata Sandi</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 pl-12 pr-5 rounded-2xl bg-white/50 border border-slate-200/50 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <p className="text-xs font-bold text-red-600">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary-600 shadow-xl shadow-primary/20 transition-all text-lg group"
                        >
                            <span>Masuk Sekarang</span>
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-10 text-center space-y-4">
                    <p className="text-sm font-medium text-slate-300">
                        Butuh bantuan teknis?{" "}
                        <button className="text-primary-400 font-bold hover:underline">
                            Hubungi Admin
                        </button>
                    </p>
                    <div className="flex justify-center gap-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
