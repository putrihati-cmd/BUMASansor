'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Star, ShoppingCart, Heart, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button, Badge } from '@/components/ui';
import { formatRupiah, calculateDiscountPercentage } from '@/lib/utils';
import useCartStore from '@/store/cart';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(query);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addItem, openCart } = useCartStore();

    useEffect(() => {
        setSearchTerm(query);
    }, [query]);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (selectedCategory) params.append('category', selectedCategory);
                if (priceRange.min) params.append('minPrice', priceRange.min);
                if (priceRange.max) params.append('maxPrice', priceRange.max);
                params.append('limit', '24');

                const res = await fetch(`/api/products?${params.toString()}`);
                const data = await res.json();
                setProducts(data.products || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchTerm, selectedCategory, priceRange.min, priceRange.max]);

    // Fetch categories
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

    const handleSearch = (e) => {
        e.preventDefault();
        window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchTerm)}`);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
    };

    return (
        <main className="flex-1 bg-neutral-50">
            {/* Search Header */}
            <div className="bg-white border-b border-neutral-100">
                <div className="container-app py-6">
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-neutral-200 focus:outline-none focus:border-primary-500 text-lg"
                                autoFocus
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className="container-app py-8">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        {searchTerm ? (
                            <h1 className="text-xl font-bold text-neutral-800">
                                Hasil pencarian &ldquo;{searchTerm}&rdquo;
                            </h1>
                        ) : (
                            <h1 className="text-xl font-bold text-neutral-800">Semua Produk</h1>
                        )}
                        <p className="text-neutral-500">{products.length} produk ditemukan</p>
                    </div>
                    <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
                        <SlidersHorizontal className="w-4 h-4" />
                        Filter
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-neutral-800">Filter</h2>
                            <button onClick={clearFilters} className="text-sm text-primary-500 hover:underline">
                                Reset Filter
                            </button>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Kategori</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Harga Min</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Harga Max</label>
                                <input
                                    type="number"
                                    placeholder="999999"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const discountPercentage = calculateDiscountPercentage(product.base_price, product.sale_price);
                            return (
                                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                    <Link href={`/products/${product.slug}`}>
                                        <div className="relative aspect-square overflow-hidden bg-neutral-100">
                                            <Image
                                                src={product.images?.[0] || '/api/placeholder/400'}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {discountPercentage > 0 && (
                                                <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                                                    -{discountPercentage}%
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="p-4">
                                        <Link href={`/products/${product.slug}`}>
                                            <h3 className="font-semibold text-neutral-800 line-clamp-2 mb-2 group-hover:text-primary-500">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            <span className="text-sm font-medium">{product.rating || 5}</span>
                                            <span className="text-sm text-neutral-400">({product.reviewCount || 0})</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4">
                                            {product.sale_price ? (
                                                <>
                                                    <span className="text-lg font-bold text-primary-500">{formatRupiah(product.sale_price)}</span>
                                                    <span className="text-sm text-neutral-400 line-through">{formatRupiah(product.base_price)}</span>
                                                </>
                                            ) : (
                                                <span className="text-lg font-bold text-neutral-800">{formatRupiah(product.base_price)}</span>
                                            )}
                                        </div>
                                        <Button
                                            fullWidth
                                            size="sm"
                                            onClick={() => {
                                                addItem(product);
                                                openCart();
                                            }}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Tambah
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Tidak ada produk ditemukan</h3>
                        <p className="text-neutral-500 mb-6">Coba kata kunci lain atau reset filter</p>
                        <Button onClick={clearFilters}>Reset Filter</Button>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <>
            <Header />
            <CartDrawer />
            <Suspense fallback={<div className="flex-1 bg-neutral-50 flex items-center justify-center"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>}>
                <SearchContent />
            </Suspense>
            <Footer />
        </>
    );
}

