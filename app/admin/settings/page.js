'use client';

import { useState, useEffect } from 'react';
import { Save, Bell, Globe, Palette, Store, CreditCard, Truck, AlertTriangle, Instagram, Facebook, MessageCircle, ToggleLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import Image from 'next/image';

const TABS = [
    { id: 'general', label: 'Umum', icon: Globe },
    { id: 'profile', label: 'Profil Toko', icon: Store },
    { id: 'financial', label: 'Keuangan', icon: CreditCard },
    { id: 'shipping', label: 'Stok & Ongkir', icon: Truck },
    { id: 'features', label: 'Fitur', icon: ToggleLeft },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [featureFlags, setFeatureFlags] = useState({});
    const [savingFeatures, setSavingFeatures] = useState(false);

    // Default Settings with REAL DATA
    const [settings, setSettings] = useState({
        // General
        siteName: 'Infiatin Store',
        siteDescription: 'Pusat Kurma & Oleh-Oleh Haji Ramadhan 2026',
        contactEmail: 'infiatinstore@gmail.com',
        contactPhone: '0851-1946-7138',
        whatsappNumber: '6285119467138',

        // Profile
        logoUrl: '/logo-infiatin.png',
        bannerUrl: '/banner-infiya.png',
        storeAddress: 'RT.09/RW.02, Cikomprang, Tegalsari, Kec. Sidareja, Kabupaten Cilacap, Jawa Tengah 53261',
        operatingHours: 'Senin - Minggu: 06:30 - 21:00 WIB',
        aboutStore: 'Infiatin Store adalah toko terpercaya yang menyediakan kurma premium, oleh-oleh haji, dan berbagai produk islami berkualitas tinggi. Kami berkomitmen memberikan pelayanan terbaik untuk memenuhi kebutuhan ibadah dan konsumsi sehat Anda.',

        // Social Media
        instagramUrl: 'https://instagram.com/infiatinstore',
        facebookUrl: 'https://facebook.com/infiatinstore',
        twitterUrl: '',

        // Financial
        currency: 'IDR',
        taxRate: 0,
        bankAccount: 'BCA: 1234567890 a.n Infiatin Store\nMandiri: 0987654321 a.n Infiatin Store',

        // Inventory
        lowStockThreshold: 5,
        enableStockAlert: true,

        // Shipping/Courier
        enabledCouriers: 'jne,pos,tiki,jnt,sicepat,anteraja', // comma-separated
        freeShippingMinAmount: 500000, // Minimum order for free shipping
        enableFreeShipping: false,

        // System
        enableNotifications: true,
        isHolidayMode: false,
    });

    useEffect(() => {
        fetchSettings();
        fetchFeatureFlags();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (res.ok && Object.keys(data).length > 0) {
                // Merge with defaults
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeatureFlags = async () => {
        try {
            const res = await fetch('/api/admin/features');
            const data = await res.json();
            if (data.success) {
                setFeatureFlags(data.features || {});
            }
        } catch (error) {
            console.error('Failed to fetch feature flags:', error);
        }
    };

    const handleFeatureToggle = (featureKey) => {
        setFeatureFlags(prev => ({
            ...prev,
            [featureKey]: {
                ...prev[featureKey],
                enabled: !prev[featureKey]?.enabled
            }
        }));
    };

    const saveFeatureFlags = async () => {
        setSavingFeatures(true);
        try {
            const res = await fetch('/api/admin/features', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: featureFlags }),
            });
            if (res.ok) {
                alert('✅ Pengaturan fitur berhasil disimpan!');
            } else {
                throw new Error('Gagal menyimpan');
            }
        } catch (error) {
            alert('❌ Gagal menyimpan: ' + error.message);
        } finally {
            setSavingFeatures(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            });

            if (res.ok) {
                alert('✅ Pengaturan berhasil disimpan!');
            } else {
                throw new Error('Gagal menyimpan');
            }
        } catch (error) {
            alert('❌ Gagal menyimpan pengaturan: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Pengaturan Toko</h1>
                    <p className="text-neutral-500">Kelola informasi toko, branding, keuangan, dan sistem</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg w-fit overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                            ${activeTab === tab.id
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm p-6 min-h-[500px]">

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Informasi Kontak</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Nama Toko"
                                    value={settings.siteName}
                                    onChange={(e) => handleChange('siteName', e.target.value)}
                                    placeholder="Infiatin Store"
                                />
                                <Input
                                    label="Tagline / Deskripsi Singkat"
                                    value={settings.siteDescription}
                                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                                    placeholder="Pusat Kurma & Oleh-Oleh Haji"
                                />
                                <Input
                                    label="Email Kontak"
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                                    placeholder="support@infiatinstore.com"
                                />
                                <Input
                                    label="Nomor Telepon"
                                    value={settings.contactPhone}
                                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                                    placeholder="0851-1946-7138"
                                />
                                <Input
                                    label="WhatsApp (Format: 628xxx)"
                                    value={settings.whatsappNumber}
                                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                                    placeholder="6285119467138"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Sistem & Notifikasi
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-neutral-50">
                                    <div>
                                        <div className="font-medium">Mode Libur / Toko Tutup</div>
                                        <div className="text-sm text-neutral-500">Nonaktifkan semua pesanan baru</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.isHolidayMode === 'true' || settings.isHolidayMode === true}
                                        onChange={(e) => handleChange('isHolidayMode', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-neutral-50">
                                    <div>
                                        <div className="font-medium">Email Notifikasi</div>
                                        <div className="text-sm text-neutral-500">Terima email saat ada pesanan baru</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.enableNotifications === 'true' || settings.enableNotifications === true}
                                        onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Logo & Banner */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Logo Toko</label>
                                    <Input
                                        value={settings.logoUrl}
                                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                                        placeholder="/logo.png"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Upload gambar ke folder <code className="bg-neutral-100 px-1 rounded">public/</code> lalu gunakan path-nya
                                    </p>
                                </div>

                                {settings.logoUrl && (
                                    <div className="p-4 border rounded-lg bg-neutral-50">
                                        <p className="text-xs text-neutral-600 mb-2">Preview Logo:</p>
                                        <div className="flex justify-center">
                                            <div className="relative w-32 h-32 bg-white rounded-lg p-2">
                                                <img
                                                    src={settings.logoUrl}
                                                    alt="Logo Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Banner Toko (Header)</label>
                                    <Input
                                        value={settings.bannerUrl}
                                        onChange={(e) => handleChange('bannerUrl', e.target.value)}
                                        placeholder="/banner.jpg"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Ukuran ideal: 1920x400px
                                    </p>
                                </div>

                                {settings.bannerUrl && (
                                    <div className="p-4 border rounded-lg bg-neutral-50">
                                        <p className="text-xs text-neutral-600 mb-2">Preview Banner:</p>
                                        <div className="relative w-full h-32 bg-neutral-200 rounded-lg overflow-hidden">
                                            <img
                                                src={settings.bannerUrl}
                                                alt="Banner Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Store Info */}
                        <div className="border-t pt-6 space-y-4">
                            <h3 className="text-lg font-semibold">Informasi Toko</h3>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Alamat Lengkap Toko</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                    value={settings.storeAddress}
                                    onChange={(e) => handleChange('storeAddress', e.target.value)}
                                    placeholder="Alamat lengkap untuk pengiriman dan kontak pelanggan..."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">Jam Operasional</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                        value={settings.operatingHours}
                                        onChange={(e) => handleChange('operatingHours', e.target.value)}
                                        placeholder="Senin - Jumat: 09:00 - 17:00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700">Tentang Toko</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                        value={settings.aboutStore}
                                        onChange={(e) => handleChange('aboutStore', e.target.value)}
                                        placeholder="Ceritakan tentang toko Anda..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700 flex items-center gap-2">
                                        <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                                    </label>
                                    <Input
                                        value={settings.instagramUrl}
                                        onChange={(e) => handleChange('instagramUrl', e.target.value)}
                                        placeholder="https://instagram.com/username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700 flex items-center gap-2">
                                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                                    </label>
                                    <Input
                                        value={settings.facebookUrl}
                                        onChange={(e) => handleChange('facebookUrl', e.target.value)}
                                        placeholder="https://facebook.com/username"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Financial Tab */}
                {activeTab === 'financial' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-amber-800 mb-1">⚠️ Penting!</h4>
                            <p className="text-sm text-amber-700">
                                Informasi rekening bank ini akan ditampilkan kepada pembeli saat mereka memilih metode pembayaran &quot;Manual Transfer&quot;.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-700">Informasi Rekening Bank</label>
                            <textarea
                                rows={6}
                                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none font-mono text-sm"
                                value={settings.bankAccount}
                                onChange={(e) => handleChange('bankAccount', e.target.value)}
                                placeholder="Bank BCA: 1234567890 a.n Nama Pemilik&#10;Bank Mandiri: 0987654321 a.n Nama Pemilik"
                            />
                            <p className="text-xs text-neutral-500">
                                Pisahkan setiap rekening dengan baris baru. Contoh format di atas.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Pajak (PPN) %</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={settings.taxRate}
                                    onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                                    placeholder="11"
                                />
                                <p className="text-xs text-neutral-500">Kosongkan atau isi 0 jika tidak ada pajak</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Mata Uang</label>
                                <select
                                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    value={settings.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                >
                                    <option value="IDR">IDR (Rupiah)</option>
                                    <option value="USD">USD (Dollar)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-1">📦 Manajemen Stok</h4>
                            <p className="text-sm text-blue-700">
                                Atur notifikasi saat stok produk menipis agar tidak kehabisan barang.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Batas Minimum Stok (Low Stock Alert)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={settings.lowStockThreshold}
                                    onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                                    placeholder="5"
                                />
                                <p className="text-xs text-neutral-500">
                                    Produk dengan stok ≤ nilai ini akan muncul warning di dashboard
                                </p>
                            </div>

                            <label className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:bg-neutral-50 h-min">
                                <div>
                                    <div className="font-medium">Aktifkan Alert Stok</div>
                                    <div className="text-sm text-neutral-500">Tampilkan warning di dashboard admin</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.enableStockAlert === 'true' || settings.enableStockAlert === true}
                                    onChange={(e) => handleChange('enableStockAlert', e.target.checked)}
                                    className="w-5 h-5 text-primary-600 rounded"
                                />
                            </label>
                        </div>

                        {/* Courier Management */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">🚚 Manajemen Kurir</h3>
                            <p className="text-sm text-neutral-600 mb-4">
                                Pilih kurir yang tersedia untuk pelanggan saat checkout
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { code: 'jne', name: 'JNE' },
                                    { code: 'pos', name: 'POS Indonesia' },
                                    { code: 'tiki', name: 'TIKI' },
                                    { code: 'jnt', name: 'J&T Express' },
                                    { code: 'sicepat', name: 'SiCepat' },
                                    { code: 'anteraja', name: 'AnterAja' },
                                ].map(courier => {
                                    const enabledCouriers = (settings.enabledCouriers || '').split(',').map(c => c.trim());
                                    const isEnabled = enabledCouriers.includes(courier.code);

                                    return (
                                        <label
                                            key={courier.code}
                                            className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:bg-neutral-50"
                                        >
                                            <div>
                                                <div className="font-medium">{courier.name}</div>
                                                <div className="text-xs text-neutral-500">{courier.code.toUpperCase()}</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={isEnabled}
                                                onChange={(e) => {
                                                    let newCouriers = enabledCouriers.filter(c => c !== courier.code);
                                                    if (e.target.checked) {
                                                        newCouriers.push(courier.code);
                                                    }
                                                    handleChange('enabledCouriers', newCouriers.join(','));
                                                }}
                                                className="w-5 h-5 text-primary-600 rounded"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Free Shipping Rules */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">🚚 Gratis Ongkir</h3>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:bg-neutral-50">
                                    <div>
                                        <div className="font-medium">Aktifkan Gratis Ongkir</div>
                                        <div className="text-sm text-neutral-500">Free shipping untuk minimal pembelian tertentu</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.enableFreeShipping === 'true' || settings.enableFreeShipping === true}
                                        onChange={(e) => handleChange('enableFreeShipping', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded"
                                    />
                                </label>

                                {(settings.enableFreeShipping === 'true' || settings.enableFreeShipping === true) && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Minimum Pembelian (Rp)
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="10000"
                                            value={settings.freeShippingMinAmount}
                                            onChange={(e) => handleChange('freeShippingMinAmount', parseInt(e.target.value))}
                                            placeholder="500000"
                                        />
                                        <p className="text-xs text-neutral-500">
                                            Contoh: Rp 500.000 = gratis ongkir untuk order ≥ 500rb
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h4 className="font-semibold text-neutral-800 mb-2">💡 Tips</h4>
                            <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                                <li>Gunakan batas stok minimal 5-10 unit untuk produk fast-moving</li>
                                <li>Update stok secara berkala untuk menghindari overselling</li>
                                <li>Aktifkan alert untuk mendapat notifikasi real-time</li>
                                <li>Pilih minimal 2-3 kurir untuk memberikan opsi ke pelanggan</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-1">🔧 Pengaturan Fitur</h4>
                            <p className="text-sm text-blue-700">
                                Aktifkan atau nonaktifkan fitur tertentu. Fitur yang dinonaktifkan akan menampilkan halaman &quot;Segera Hadir&quot; kepada pengguna.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={saveFeatureFlags} disabled={savingFeatures}>
                                <Save className="w-4 h-4" />
                                {savingFeatures ? 'Menyimpan...' : 'Simpan Pengaturan Fitur'}
                            </Button>
                        </div>

                        {/* Feature Groups */}
                        <div className="space-y-6">
                            {/* Points Features */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    🪙 Sistem Koin / Poin
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(featureFlags)
                                        .filter(([key, value]) => value.category === 'points')
                                        .map(([key, feature]) => (
                                            <label
                                                key={key}
                                                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${feature.enabled
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-neutral-200 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-medium">{feature.name}</div>
                                                    <div className="text-sm text-neutral-500">{feature.description}</div>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={feature.enabled}
                                                        onChange={() => handleFeatureToggle(key)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-14 h-8 rounded-full transition-colors ${feature.enabled ? 'bg-green-500' : 'bg-neutral-300'
                                                        }`}>
                                                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${feature.enabled ? 'translate-x-7' : 'translate-x-1'
                                                            }`} />
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                </div>
                            </div>

                            {/* Payment Features */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    💳 Pembayaran
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(featureFlags)
                                        .filter(([key, value]) => value.category === 'payment' || value.category === 'checkout')
                                        .map(([key, feature]) => (
                                            <label
                                                key={key}
                                                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${feature.enabled
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-neutral-200 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-medium">{feature.name}</div>
                                                    <div className="text-sm text-neutral-500">{feature.description}</div>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={feature.enabled}
                                                        onChange={() => handleFeatureToggle(key)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-14 h-8 rounded-full transition-colors ${feature.enabled ? 'bg-green-500' : 'bg-neutral-300'
                                                        }`}>
                                                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${feature.enabled ? 'translate-x-7' : 'translate-x-1'
                                                            }`} />
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                </div>
                            </div>

                            {/* Other Features */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    ⚡ Fitur Lainnya
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(featureFlags)
                                        .filter(([key, value]) => !['points', 'payment', 'checkout'].includes(value.category))
                                        .map(([key, feature]) => (
                                            <label
                                                key={key}
                                                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${feature.enabled
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-neutral-200 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-medium">{feature.name}</div>
                                                    <div className="text-sm text-neutral-500">{feature.description}</div>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={feature.enabled}
                                                        onChange={() => handleFeatureToggle(key)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-14 h-8 rounded-full transition-colors ${feature.enabled ? 'bg-green-500' : 'bg-neutral-300'
                                                        }`}>
                                                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${feature.enabled ? 'translate-x-7' : 'translate-x-1'
                                                            }`} />
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h4 className="font-semibold text-neutral-800 mb-2">💡 Tips</h4>
                            <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                                <li>Fitur yang dinonaktifkan akan menampilkan halaman &quot;Segera Hadir&quot;</li>
                                <li>Aktifkan fitur hanya jika sudah siap digunakan</li>
                                <li>Perubahan akan langsung berlaku setelah disimpan</li>
                            </ul>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

