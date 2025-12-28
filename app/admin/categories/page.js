'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/categories', {
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Gagal mengambil data kategori');

            const data = await res.json();
            setCategories(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal menghapus kategori');
            }

            alert('✅ ' + data.message);
            fetchCategories(); // Refresh list
        } catch (error) {
            alert('❌ ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-medium">{error}</p>
                <Button onClick={fetchCategories} className="mt-4">
                    Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">
                        Kategori Produk
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Kelola kategori dan sub-kategori produk
                    </p>
                </div>
                <Link href="/admin/categories/new">
                    <Button>
                        <Plus className="w-4 h-4" />
                        Tambah Kategori
                    </Button>
                </Link>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">
                                Nama Kategori
                            </th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">
                                Slug
                            </th>
                            <th className="text-center px-6 py-4 text-sm font-semibold text-neutral-700">
                                Jumlah Produk
                            </th>
                            <th className="text-center px-6 py-4 text-sm font-semibold text-neutral-700">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-neutral-500">
                                    Belum ada kategori. Klik tombol &ldquo;Tambah Kategori&rdquo; untuk membuat kategori baru.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {category.imageUrl && (
                                                <img
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-neutral-800">
                                                    {category.name}
                                                </p>
                                                {category.description && (
                                                    <p className="text-sm text-neutral-500 mt-0.5">
                                                        {category.description.substring(0, 60)}
                                                        {category.description.length > 60 && '...'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                                            {category.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1 text-neutral-600">
                                            <Package className="w-4 h-4" />
                                            <span className="font-medium">{category._count?.products || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/admin/categories/${category.id}/edit`}>
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stats */}
            <div className="mt-4 text-sm text-neutral-500 text-center">
                Total: <strong>{categories.length}</strong> kategori
            </div>
        </div>
    );
}

