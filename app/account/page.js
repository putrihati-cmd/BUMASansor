'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    User,
    ShoppingBag,
    Heart,
    MapPin,
    Bell,
    Lock,
    LogOut,
    ChevronRight,
    Edit,
    Camera
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button, Input, Badge } from '@/components/ui';
import useUserStore from '@/store/user';

const menuItems = [
    { href: '/account', icon: User, label: 'Profil Saya', desc: 'Edit informasi akun' },
    { href: '/account/orders', icon: ShoppingBag, label: 'Pesanan Saya', desc: 'Lihat riwayat pesanan', badge: 3 },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist', desc: 'Produk favorit' },
    { href: '/account/addresses', icon: MapPin, label: 'Alamat', desc: 'Kelola alamat pengiriman' },
    { href: '/account/notifications', icon: Bell, label: 'Notifikasi', desc: 'Pengaturan notifikasi' },
    { href: '/account/security', icon: Lock, label: 'Keamanan', desc: 'Password & keamanan' },
];

export default function AccountPage() {
    const { user, isAuthenticated, logout } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsEditing(false);
                alert('Profil berhasil diperbarui!');
            } else {
                alert('Gagal memperbarui profil');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            alert('Terjadi kesalahan');
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file maksimal 2MB');
            return;
        }

        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetch('/api/auth/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setAvatarUrl(data.avatarUrl);
                alert('Avatar berhasil diupload!');
            } else {
                alert(data.error || 'Gagal upload avatar');
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            alert('Terjadi kesalahan saat upload');
        } finally {
            setAvatarUploading(false);
        }
    };

    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-50">
                <div className="container-app py-8">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                {/* User Info */}
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="relative mb-4">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={formData.name}
                                                className="w-20 h-20 rounded-full object-cover border-2 border-primary-200"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary-600">
                                                    {formData.name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        )}
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-primary-600 transition-colors"
                                        >
                                            {avatarUploading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Camera className="w-4 h-4" />
                                            )}
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            disabled={avatarUploading}
                                        />
                                    </div>
                                    <h2 className="font-bold text-neutral-800">{formData.name}</h2>
                                    <p className="text-sm text-neutral-500">{formData.email}</p>
                                    <Badge variant="primary" className="mt-2">Member</Badge>
                                </div>

                                {/* Menu */}
                                <nav className="space-y-1">
                                    {menuItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-primary-500" />
                                                <span className="text-neutral-700 group-hover:text-primary-500">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.badge && (
                                                    <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-neutral-300" />
                                            </div>
                                        </Link>
                                    ))}
                                </nav>

                                {/* Logout */}
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 p-3 w-full mt-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Keluar</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className="text-xl font-bold text-neutral-800">Profil Saya</h1>
                                        <p className="text-neutral-500">Kelola informasi profil Anda</p>
                                    </div>
                                    {!isEditing ? (
                                        <Button variant="secondary" onClick={() => setIsEditing(true)}>
                                            <Edit className="w-4 h-4" />
                                            Edit Profil
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                                Batal
                                            </Button>
                                            <Button onClick={handleSave}>Simpan</Button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="Nama Lengkap"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Nomor Telepon"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    <Input
                                        label="Tanggal Bergabung"
                                        value="16 Desember 2024"
                                        disabled
                                    />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-neutral-100">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-primary-500">12</p>
                                        <p className="text-sm text-neutral-500">Total Pesanan</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-primary-500">5</p>
                                        <p className="text-sm text-neutral-500">Wishlist</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-primary-500">2</p>
                                        <p className="text-sm text-neutral-500">Alamat</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

