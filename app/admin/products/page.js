'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Upload, Download, Copy, Package } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';

const statusConfig = {
    ACTIVE: { label: 'Aktif', color: 'success' },
    INACTIVE: { label: 'Nonaktif', color: 'secondary' },
    SOLD_OUT: { label: 'Habis', color: 'danger' },
    ARCHIVED: { label: 'Diarsipkan', color: 'secondary' },
};

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: pagination.page,
                limit: 20,
            });
            if (search) params.append('search', search);
            if (categoryFilter) params.append('category', categoryFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/admin/products?${params}`, {
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Gagal mengambil data produk');
            }

            const data = await res.json();
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [pagination.page, statusFilter, categoryFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleDelete = async (productId, productName) => {
        if (!confirm(`Yakin ingin menghapus "${productName}"?`)) return;

        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Gagal menghapus produk');

            alert('✅ Produk berhasil dihapus');
            fetchProducts();
        } catch (err) {
            alert('❌ ' + err.message);
        }
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) {
            alert('Pilih file Excel terlebih dahulu');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', bulkFile);

            const res = await fetch('/api/admin/products/bulk-upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                alert(`✅ ${data.message}\n\nBerhasil: ${data.results.success}\nGagal: ${data.results.failed}`);
                if (data.results.errors.length > 0) {
                    console.log('Upload errors:', data.results.errors);
                }
                setShowBulkModal(false);
                setBulkFile(null);
                fetchProducts();
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDuplicate = async (productId, productName) => {
        if (!confirm(`Duplikat "${productName}"?`)) return;

        try {
            const res = await fetch(`/api/admin/products/${productId}/duplicate`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Gagal menduplikat produk');

            alert('✅ Produk berhasil diduplikat');
            fetchProducts();
        } catch (err) {
            alert('❌ ' + err.message);
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
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <button
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Produk</h1>
                    <p className="text-neutral-500">Kelola katalog produk toko Anda</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowBulkModal(true)}>
                        <Upload className="w-4 h-4" />
                        Bulk Upload
                    </Button>
                    <Link href="/admin/products/new">
                        <Button>
                            <Plus className="w-4 h-4" />
                            Tambah Produk
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="INACTIVE">Nonaktif</option>
                        <option value="SOLD_OUT">Habis</option>
                    </select>
                    <button type="submit" className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                        Cari
                    </button>
                </form>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Produk</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Kategori</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Harga</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Stok</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100">
                                                    {product.images?.[0] ? (
                                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                            <Package className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-800">{product.name}</p>
                                                    {product.isFeatured && (
                                                        <Badge variant="primary" size="sm">Featured</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600">{product.category}</td>
                                        <td className="px-4 py-4">
                                            {product.salePrice ? (
                                                <div>
                                                    <p className="font-semibold text-primary-500">{formatRupiah(product.salePrice)}</p>
                                                    <p className="text-sm text-neutral-400 line-through">{formatRupiah(product.basePrice)}</p>
                                                </div>
                                            ) : (
                                                <p className="font-semibold text-neutral-800">{formatRupiah(product.basePrice)}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`font-medium ${product.stock <= 10 ? 'text-red-500' : 'text-neutral-800'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusConfig[product.status].color}>
                                                {statusConfig[product.status].label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                                                    title="Lihat"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDuplicate(product.id, product.name)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                                    title="Duplikat"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-neutral-500">
                                        Belum ada produk
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-4 border-t border-neutral-100 flex items-center justify-between">
                    <p className="text-sm text-neutral-500">
                        Menampilkan {products.length} dari {pagination.total} produk
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold text-neutral-800 mb-4">Bulk Upload Produk</h2>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800 mb-2">📝 Langkah-langkah:</p>
                                <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                                    <li>Download template Excel</li>
                                    <li>Isi data produk sesuai format</li>
                                    <li>Upload file yang sudah diisi</li>
                                </ol>
                            </div>

                            <div>
                                <Link
                                    href="/api/admin/products/bulk-upload"
                                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Template
                                </Link>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Upload File Excel
                                </label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => setBulkFile(e.target.files[0])}
                                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                                />
                                {bulkFile && (
                                    <p className="mt-2 text-sm text-neutral-600">
                                        File: {bulkFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setShowBulkModal(false);
                                        setBulkFile(null);
                                    }}
                                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                                    disabled={uploading}
                                >
                                    Batal
                                </button>
                                <Button onClick={handleBulkUpload} disabled={uploading || !bulkFile}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

