'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import ImageUploader from '@/components/ImageUploader';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        basePrice: '',
        salePrice: '',
        stock: '',
        weight: '',
        isFeatured: false,
        images: [],
        variants: [],
    });

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                setCategories(data.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleAddVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { name: '', sku: '', stock: 0, priceAdjustment: 0 }],
        });
    };

    const handleRemoveVariant = (index) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    // AI Generate Description Handler
    const handleGenerateAI = async () => {
        // Validate inputs
        if (!formData.name || formData.name.trim().length < 3) {
            alert('⚠️ Masukkan nama produk terlebih dahulu (minimal 3 karakter)');
            return;
        }

        if (!formData.categoryId) {
            alert('⚠️ Pilih kategori produk terlebih dahulu');
            return;
        }

        // Get category name
        const selectedCategory = categories.find(c => c.id === formData.categoryId);
        const categoryName = selectedCategory?.name || formData.categoryId;

        setAiLoading(true);

        try {
            const res = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: formData.name.trim(),
                    category: categoryName,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal generate deskripsi');
            }

            // Update description field
            setFormData(prev => ({
                ...prev,
                description: data.data.description,
            }));

            // Success notification
            alert('✨ Deskripsi berhasil di-generate! Silakan review dan edit jika perlu.');

        } catch (error) {
            alert('❌ ' + error.message);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    categoryId: formData.categoryId,
                    basePrice: parseFloat(formData.basePrice),
                    salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                    stock: parseInt(formData.stock),
                    weight: parseInt(formData.weight),
                    isFeatured: formData.isFeatured,
                    images: formData.images,
                    status: 'ACTIVE',
                    variants: formData.variants.map(v => ({
                        name: v.name,
                        sku: v.sku,
                        stock: parseInt(v.stock) || 0,
                        priceAdjustment: parseFloat(v.priceAdjustment) || 0,
                    })),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal menambahkan produk');
            }

            alert('✅ ' + data.message);
            router.push('/admin/products');
        } catch (error) {
            alert('❌ ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <Link href="/admin/products" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Produk
                </Link>
                <h1 className="text-2xl font-display font-bold text-neutral-800">Tambah Produk Baru</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">Informasi Produk</h2>
                    <div className="grid gap-4">
                        <Input
                            label="Nama Produk"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contoh: Serum Vitamin C Brightening"
                            required
                        />
                        <Input
                            label="Slug URL"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="serum-vitamin-c-brightening"
                            helperText="URL: /products/serum-vitamin-c-brightening"
                        />
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Deskripsi
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Deskripsi lengkap produk... (atau klik tombol AI di bawah)"
                                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:outline-none focus:border-primary-500"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                disabled={aiLoading}
                                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {aiLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        ✨ Generate AI Description
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-neutral-500 mt-1">
                                * AI akan generate deskripsi berdasarkan nama produk & kategori
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Kategori
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:outline-none focus:border-primary-500"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">Harga & Stok</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Harga Normal"
                            name="basePrice"
                            type="number"
                            value={formData.basePrice}
                            onChange={handleChange}
                            placeholder="189000"
                            required
                        />
                        <Input
                            label="Harga Promo (Opsional)"
                            name="salePrice"
                            type="number"
                            value={formData.salePrice}
                            onChange={handleChange}
                            placeholder="149000"
                        />
                        <Input
                            label="Stok"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="100"
                            required
                        />
                        <Input
                            label="Berat (gram)"
                            name="weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="100"
                            required
                        />
                    </div>
                    <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-neutral-700">Tampilkan sebagai produk unggulan (Featured)</span>
                    </label>
                </div>

                {/* Variants */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-800">Varian (Opsional)</h2>
                        <Button type="button" variant="secondary" size="sm" onClick={handleAddVariant}>
                            <Plus className="w-4 h-4" />
                            Tambah Varian
                        </Button>
                    </div>
                    {formData.variants.length === 0 ? (
                        <p className="text-neutral-500 text-sm">Belum ada varian. Klik tombol di atas untuk menambahkan.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-neutral-50 rounded-lg">
                                    <div className="flex-1 grid sm:grid-cols-4 gap-3">
                                        <Input
                                            placeholder="Nama varian (Size L)"
                                            value={variant.name}
                                            onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                        />
                                        <Input
                                            placeholder="SKU"
                                            value={variant.sku}
                                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Stok"
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                                        />
                                        <Input
                                            placeholder="Selisih harga"
                                            type="number"
                                            value={variant.priceAdjustment}
                                            onChange={(e) => handleVariantChange(index, 'priceAdjustment', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <ImageUploader
                        images={formData.images}
                        onImagesChange={(newImages) => setFormData({ ...formData, images: newImages })}
                        maxImages={5}
                        label="Gambar Produk"
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                    <Link href="/admin/products">
                        <Button type="button" variant="secondary">Batal</Button>
                    </Link>
                    <Button type="submit" loading={loading}>
                        Simpan Produk
                    </Button>
                </div>
            </form>
        </div>
    );
}

