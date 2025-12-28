'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import useUserStore from '@/store/user';

function CompleteProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useUserStore();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!userId && !token) {
            router.push('/auth/register');
        }
    }, [userId, token, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Nama wajib diisi';
        }
        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password minimal 8 karakter';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const res = await fetch('/api/auth/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    token,
                    name: formData.name,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ submit: data.error || 'Gagal menyelesaikan registrasi' });
                return;
            }

            // Set user and redirect
            setUser(data.user, data.token);
            alert('🎉 Registrasi berhasil! Selamat datang di Infiatin Store');
            router.push('/');
        } catch (err) {
            console.error(err);
            setErrors({ submit: 'Terjadi kesalahan jaringan' });
        } finally {
            setLoading(false);
        }
    };

    // Password strength
    const getStrength = (pw) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[a-z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };
    const strength = getStrength(formData.password);
    const strengthLabel = ['', 'Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">i</span>
                    </div>
                    <span className="font-display text-xl font-bold text-neutral-800">
                        Infiatin<span className="text-primary-500">Store</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-neutral-800 mb-1">
                            Lengkapi Profil
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Satu langkah lagi untuk menyelesaikan pendaftaran
                        </p>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nama Lengkap"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama Anda"
                            leftIcon={<User className="w-5 h-5" />}
                            error={errors.name}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimal 8 karakter"
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

                        {formData.password && (
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1 flex-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full ${strength >= i ? 'bg-primary-500' : 'bg-neutral-200'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-neutral-500">{strengthLabel}</span>
                            </div>
                        )}

                        <Input
                            label="Konfirmasi Password"
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Ulangi password"
                            leftIcon={<Lock className="w-5 h-5" />}
                            error={errors.confirmPassword}
                        />

                        <Button type="submit" fullWidth loading={loading}>
                            Selesaikan Pendaftaran
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function CompleteProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CompleteProfileContent />
        </Suspense>
    );
}

