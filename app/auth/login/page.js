'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import useUserStore from '@/store/user';

export default function LoginPage() {
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
            newErrors.email = 'Email atau nomor WhatsApp wajib diisi';
        }
        // Remove email format validation since it can be a phone number now

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
            // Call actual login API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important: Send/receive cookies
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ submit: data.error || 'Login gagal' });
                return;
            }

            // Set user in store
            setUser(data.user, data.token);

            // Redirect based on role
            if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ submit: 'Terjadi kesalahan. Silakan coba lagi.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">i</span>
                    </div>
                    <span className="font-display text-2xl font-bold text-neutral-800">
                        Infiatin<span className="text-primary-500">Store</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-xl md:text-2xl font-display font-bold text-neutral-800 mb-2">
                            Selamat Datang Kembali! 👋
                        </h1>
                        <p className="text-sm md:text-base text-neutral-500">
                            Masuk ke akun Anda untuk melanjutkan belanja
                        </p>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email atau  Nomor WhatsApp"
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="nama@email.com atau 08xxxxxxxxxx"
                            leftIcon={<Mail className="w-5 h-5" />}
                            error={errors.email}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Masukkan password"
                                leftIcon={<Lock className="w-5 h-5" />}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                                <span className="text-sm text-neutral-600">Ingat saya</span>
                            </label>
                            <Link href="/auth/forgot-password" className="text-sm text-primary-500 hover:underline">
                                Lupa password?
                            </Link>
                        </div>

                        <Button type="submit" fullWidth size="lg" loading={loading}>
                            Masuk
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-neutral-500">Atau masuk dengan</span>
                        </div>
                    </div>

                    <GoogleLoginButton />

                    <div className="mt-6 text-center">
                        <p className="text-neutral-500">
                            Belum punya akun?{' '}
                            <Link href="/auth/register" className="text-primary-500 font-semibold hover:underline">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-sm text-neutral-400 mt-6">
                    Dengan masuk, Anda menyetujui{' '}
                    <Link href="/terms" className="text-primary-500 hover:underline">Syarat & Ketentuan</Link>
                    {' '}dan{' '}
                    <Link href="/privacy" className="text-primary-500 hover:underline">Kebijakan Privasi</Link>
                </p>
            </div>
        </div>
    );
}

