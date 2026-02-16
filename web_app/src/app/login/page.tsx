"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

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
            // The ResponseInterceptor already unwraps to response.data
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
        <div className="flex flex-col h-screen px-8 justify-center bg-white">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">BUMAS Ansor</h1>
                <p className="text-slate-500 font-medium">Badan Usaha Milik Ansor</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                        placeholder="nama@email.com"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                    Masuk Sekarang
                </Button>
            </form>

            <p className="mt-8 text-center text-xs font-medium text-slate-400">
                Butuh bantuan? Hubungi Admin BUMAS
            </p>
        </div>
    );
}
