'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Check, Home, Briefcase, RefreshCw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button, Input, Badge } from '@/components/ui';
import useUserStore from '@/store/user';

const labelIcons = {
    HOME: Home,
    OFFICE: Briefcase,
};

export default function AddressesPage() {
    const { isAuthenticated } = useUserStore();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        label: 'HOME',
        recipientName: '',
        phone: '',
        fullAddress: '',
        province: '',
        city: '',
        district: '',
        postalCode: '',
        isDefault: false,
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/addresses', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses || []);
            }
        } catch (error) {
            console.error('Fetch addresses error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingId
                ? `/api/addresses?id=${editingId}`
                : '/api/addresses';

            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                await fetchAddresses();
                resetForm();
            } else {
                alert(data.error || 'Gagal menyimpan alamat');
            }
        } catch (error) {
            console.error('Save address error:', error);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (address) => {
        setFormData({
            label: address.label || 'HOME',
            recipientName: address.recipientName || '',
            phone: address.phone || '',
            fullAddress: address.fullAddress || '',
            province: address.province || '',
            city: address.city || '',
            district: address.district || '',
            postalCode: address.postalCode || '',
            isDefault: address.isDefault || false,
        });
        setEditingId(address.id);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus alamat ini?')) return;

        try {
            const res = await fetch(`/api/addresses?id=${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                setAddresses(addresses.filter((addr) => addr.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || 'Gagal menghapus alamat');
            }
        } catch (error) {
            console.error('Delete address error:', error);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await fetch(`/api/addresses?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isDefault: true }),
            });

            if (res.ok) {
                await fetchAddresses();
            }
        } catch (error) {
            console.error('Set default error:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            label: 'HOME',
            recipientName: '',
            phone: '',
            fullAddress: '',
            province: '',
            city: '',
            district: '',
            postalCode: '',
            isDefault: false,
        });
        setIsAdding(false);
        setEditingId(null);
    };

    if (!isAuthenticated) {
        return (
            <>
                <Header />
                <CartDrawer />
                <main className="flex-1 bg-neutral-50 flex items-center justify-center">
                    <div className="text-center px-4">
                        <MapPin className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-neutral-800 mb-2">
                            Alamat Saya
                        </h1>
                        <p className="text-neutral-500 mb-6">
                            Masuk untuk mengelola alamat
                        </p>
                        <Link href="/auth/login">
                            <Button>Masuk</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-50">
                <div className="container-app py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/account" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Akun
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-800">Alamat Saya</h1>
                                <p className="text-neutral-500">Kelola alamat pengiriman Anda</p>
                            </div>
                            {!isAdding && (
                                <Button onClick={() => setIsAdding(true)}>
                                    <Plus className="w-4 h-4" />
                                    Tambah Alamat
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Add/Edit Form */}
                    {isAdding && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                                {editingId ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Label</label>
                                    <div className="flex gap-3">
                                        {['HOME', 'OFFICE'].map((label) => {
                                            const Icon = labelIcons[label];
                                            return (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, label })}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-colors ${formData.label === label
                                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {label === 'HOME' ? 'Rumah' : 'Kantor'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Input
                                    label="Nama Penerima"
                                    name="recipientName"
                                    value={formData.recipientName}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Nomor Telepon"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Alamat Lengkap"
                                        name="fullAddress"
                                        value={formData.fullAddress}
                                        onChange={handleChange}
                                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                                        required
                                    />
                                </div>
                                <Input
                                    label="Provinsi"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Kota"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Kecamatan"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Kode Pos"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={formData.isDefault}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded border-neutral-300 text-primary-500"
                                        />
                                        <span className="text-neutral-700">Jadikan alamat utama</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button variant="secondary" onClick={resetForm} disabled={saving}>Batal</Button>
                                <Button onClick={handleSave} loading={saving}>
                                    {saving ? 'Menyimpan...' : 'Simpan Alamat'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <RefreshCw className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
                            <p className="text-neutral-500">Memuat alamat...</p>
                        </div>
                    ) : (
                        /* Address List */
                        <div className="space-y-4">
                            {addresses.map((address) => {
                                const LabelIcon = labelIcons[address.label] || Home;
                                return (
                                    <div key={address.id} className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <LabelIcon className="w-5 h-5 text-primary-500" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-neutral-800">
                                                            {address.label === 'HOME' ? 'Rumah' : address.label === 'OFFICE' ? 'Kantor' : address.label}
                                                        </span>
                                                        {address.isDefault && (
                                                            <Badge variant="primary" size="sm">Utama</Badge>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-neutral-700">{address.recipientName}</p>
                                                    <p className="text-sm text-neutral-500">{address.phone}</p>
                                                    <p className="text-sm text-neutral-500 mt-1">
                                                        {address.fullAddress}
                                                        {address.district && `, ${address.district}`}
                                                        {address.city && `, ${address.city}`}
                                                        {address.province && `, ${address.province}`}
                                                        {address.postalCode && ` ${address.postalCode}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:flex-shrink-0">
                                                {!address.isDefault && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleSetDefault(address.id)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Jadikan Utama
                                                    </Button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(address)}
                                                    className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(address.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {addresses.length === 0 && !isAdding && (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                    <MapPin className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Belum ada alamat</h3>
                                    <p className="text-neutral-500 mb-6">Tambahkan alamat pengiriman Anda</p>
                                    <Button onClick={() => setIsAdding(true)}>
                                        <Plus className="w-4 h-4" />
                                        Tambah Alamat
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

