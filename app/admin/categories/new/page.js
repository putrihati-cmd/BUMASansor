'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function NewCategoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal menambahkan kategori');
            }

            alert('✅ ' + data.message);
            router.push('/admin/categories');
        } catch (error) {
            alert('❌ ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-6">
                <Link href="/admin/categories" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Kategori
                </Link>
                <h1 className="text-2xl font-display font-bold text-neutral-800">Tambah Kategori Baru</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">Informasi Kategori</h2>
                    <div className="grid gap-4">
                        <Input
                            label="Nama Kategori"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contoh: Kurma & Buah Kering"
                            required
                        />
                        <Input
                            label="Slug URL"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="kurma-buah-kering"
                            helperText="URL: /category/kurma-buah-kering"
                        />
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Deskripsi (Opsional)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Deskripsi singkat kategori..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:outline-none focus:border-primary-500"
                            />
                        </div>
                        <Input
                            label="URL Gambar (Opsional)"
                            name="imageUrl"
                            type="url"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            helperText="Gunakan URL gambar dari Unsplash, Imgur, dll"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                    <Link href="/admin/categories">
                        <Button type="button" variant="secondary">Batal</Button>
                    </Link>
                    <Button type="submit" loading={loading}>
                        Simpan Kategori
                    </Button>
                </div>
            </form>
        </div>
    );
}

