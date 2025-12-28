'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import useUserStore from '@/store/user';

export default function AdminLoginPage() {
    const router = useRouter();
    const { setUser } = useUserStore();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ submit: data.error || 'Login gagal' });
                return;
            }

            // Verify admin role
            if (!['ADMIN', 'SUPER_ADMIN'].includes(data.user.role)) {
                setErrors({ submit: 'Akses ditolak. Halaman ini hanya untuk admin.' });
                return;
            }

            // Set user in store
            setUser(data.user, data.token);

            // Redirect to admin dashboard
            router.push('/admin');
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ submit: 'Terjadi kesalahan. Silakan coba lagi.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <span className="font-display text-2xl font-bold text-white">
                            Admin Panel
                        </span>
                        <p className="text-xs text-neutral-400">Infiatin Store</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-xl md:text-2xl font-display font-bold text-white mb-2">
                            Login Admin 🔐
                        </h1>
                        <p className="text-sm md:text-base text-neutral-400">
                            Masuk dengan akun administrator
                        </p>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-xl mb-6 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Email Admin
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@infiatin.store"
                                    className={`w-full pl-10 pr-4 py-3 bg-neutral-900 border ${errors.email ? 'border-red-500' : 'border-neutral-700'
                                        } rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Masukkan password admin"
                                    className={`w-full pl-10 pr-12 py-3 bg-neutral-900 border ${errors.password ? 'border-red-500' : 'border-neutral-700'
                                        } rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={loading}
                            className="bg-primary-500 hover:bg-primary-600"
                        >
                            Masuk ke Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-neutral-700">
                        <p className="text-center text-sm text-neutral-500">
                            Bukan admin?{' '}
                            <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                                Login sebagai customer
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                    <p className="text-xs text-amber-400 text-center">
                        ⚠️ Halaman ini hanya untuk administrator. Semua aktivitas login dicatat untuk audit keamanan.
                    </p>
                </div>

                {/* Back to Store */}
                <p className="text-center text-sm text-neutral-500 mt-6">
                    <Link href="/" className="hover:text-primary-400 transition-colors">
                        ← Kembali ke Toko
                    </Link>
                </p>
            </div>
        </div>
    );
}

