'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    Shield,
    Key,
    Camera,
    Save,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    ArrowLeft
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import useUserStore from '@/store/user';
import Link from 'next/link';

export default function AdminProfilePage() {
    const router = useRouter();
    const { user, updateUser } = useUserStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // Password form
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setProfile({
                    name: data.user?.name || '',
                    email: data.user?.email || '',
                    phone: data.user?.phone || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (key, value) => {
        setProfile(prev => ({ ...prev, [key]: value }));
    };

    const handlePasswordChange = (key, value) => {
        setPasswords(prev => ({ ...prev, [key]: value }));
    };

    const saveProfile = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
                // Update Zustand store
                updateUser({ name: profile.name, phone: profile.phone });
            } else {
                throw new Error(data.message || 'Gagal memperbarui profil');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        // Validation
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Semua field password harus diisi' });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
            return;
        }

        if (passwords.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password baru minimal 8 karakter' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password berhasil diubah!' });
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                throw new Error(data.message || 'Gagal mengubah password');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin"
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-neutral-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Profil Admin</h1>
                    <p className="text-neutral-500">Kelola informasi akun dan keamanan Anda</p>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {message.type === 'success'
                        ? <CheckCircle className="w-5 h-5" />
                        : <AlertCircle className="w-5 h-5" />
                    }
                    <span>{message.text}</span>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-3xl font-bold text-primary-600">
                                    {profile.name?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-100 transition-colors">
                                <Camera className="w-4 h-4 text-neutral-600" />
                            </button>
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">{profile.name || 'Admin'}</h2>
                            <p className="text-white/80">{profile.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'profile'
                                ? 'text-primary-600 border-b-2 border-primary-500'
                                : 'text-neutral-600 hover:text-neutral-800'
                            }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Informasi Profil
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'security'
                                ? 'text-primary-600 border-b-2 border-primary-500'
                                : 'text-neutral-600 hover:text-neutral-800'
                            }`}
                    >
                        <Key className="w-4 h-4 inline mr-2" />
                        Keamanan
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Nama Lengkap
                                    </label>
                                    <Input
                                        value={profile.name}
                                        onChange={(e) => handleProfileChange('name', e.target.value)}
                                        placeholder="Nama Anda"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-neutral-100 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-neutral-500">Email tidak dapat diubah</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Nomor Telepon
                                    </label>
                                    <Input
                                        value={profile.phone}
                                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        <Shield className="w-4 h-4 inline mr-2" />
                                        Role
                                    </label>
                                    <Input
                                        value={user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                        disabled
                                        className="bg-neutral-100 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={saveProfile} disabled={saving}>
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="font-semibold text-amber-800 mb-1">⚠️ Perhatian</h4>
                                <p className="text-sm text-amber-700">
                                    Pastikan Anda mengingat password baru. Setelah diubah, gunakan password baru untuk login.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Password Saat Ini
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={passwords.currentPassword}
                                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                            placeholder="Masukkan password saat ini"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwords.newPassword}
                                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwords.confirmPassword}
                                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                            placeholder="Ulangi password baru"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={changePassword} disabled={saving} variant="danger">
                                    <Key className="w-4 h-4" />
                                    {saving ? 'Mengubah...' : 'Ubah Password'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-neutral-800 mb-4">Informasi Akun</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-500">User ID</span>
                        <span className="font-mono text-neutral-700">{user?.id?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-500">Role</span>
                        <span className="font-medium text-neutral-700">{user?.role}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-500">Status Akun</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aktif</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-500">Email Terverifikasi</span>
                        <span className="text-neutral-700">{user?.emailVerifiedAt ? '✅ Ya' : '❌ Belum'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

