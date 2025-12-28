'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, Grid3X3, List, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { ProductCard } from '@/components/product';
import { Button, Badge } from '@/components/ui';
import { formatRupiah } from '@/lib/utils';

const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'popular', label: 'Paling Populer' },
    { value: 'rating', label: 'Rating Tertinggi' },
];

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryParam = searchParams.get('category');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                params.append('limit', '24');
                params.append('sort', sortBy);
                if (selectedCategory) params.append('category', selectedCategory);
                if (priceRange.min > 0) params.append('minPrice', priceRange.min.toString());
                if (priceRange.max < 1000000) params.append('maxPrice', priceRange.max.toString());

                const res = await fetch(`/api/products?${params.toString()}`);
                const data = await res.json();
                setProducts(data.products || []);
                setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [sortBy, selectedCategory, priceRange]);

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

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange({ min: 0, max: 1000000 });
        setSortBy('newest');
    };

    const hasActiveFilters = selectedCategory || priceRange.min > 0 || priceRange.max < 1000000;

    return (
        <main className="flex-1 bg-neutral-50">
            {/* Page Header */}
            <div className="bg-white border-b border-neutral-100">
                <div className="container-app py-8">
                    <h1 className="text-3xl font-display font-bold text-neutral-800 mb-2">
                        {selectedCategory
                            ? categories.find(c => c.slug === selectedCategory)?.name || 'Produk'
                            : 'Semua Produk'}
                    </h1>
                    <p className="text-neutral-500">
                        {pagination.total} produk ditemukan
                    </p>
                </div>
            </div>

            <div className="container-app py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-neutral-800">Filter</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-primary-500 hover:underline"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <h4 className="font-medium text-neutral-700 mb-3">Kategori</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === ''
                                            ? 'bg-primary-50 text-primary-600 font-medium'
                                            : 'hover:bg-neutral-50'
                                            }`}
                                    >
                                        Semua Kategori
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.slug)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.slug
                                                ? 'bg-primary-50 text-primary-600 font-medium'
                                                : 'hover:bg-neutral-50'
                                                }`}
                                        >
                                            {category.name}
                                            <span className="text-neutral-400 text-sm ml-1">
                                                ({category._count?.products || 0})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h4 className="font-medium text-neutral-700 mb-3">Harga</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-neutral-500">Minimum</label>
                                        <input
                                            type="number"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                            className="input mt-1"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-500">Maximum</label>
                                        <input
                                            type="number"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                            className="input mt-1"
                                            placeholder="1000000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setShowFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-neutral-200"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filter
                            </button>

                            {/* Active Filters */}
                            {hasActiveFilters && (
                                <div className="hidden lg:flex items-center gap-2">
                                    {selectedCategory && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            {categories.find(c => c.slug === selectedCategory)?.name}
                                            <button onClick={() => setSelectedCategory('')}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Sort & View */}
                            <div className="flex items-center gap-4 ml-auto">
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 bg-white rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* View Toggle */}
                                <div className="hidden sm:flex items-center gap-1 bg-white rounded-xl p-1 border border-neutral-200">
                                    <button
                                        onClick={() => setView('grid')}
                                        className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-50 text-primary-500' : 'text-neutral-400'
                                            }`}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setView('list')}
                                        className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary-50 text-primary-500' : 'text-neutral-400'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                            </div>
                        ) : products.length > 0 ? (
                            <div className={`grid gap-4 md:gap-6 ${view === 'grid'
                                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                                }`}>
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-neutral-500 mb-4">Tidak ada produk yang ditemukan</p>
                                <Button onClick={clearFilters} variant="secondary">
                                    Reset Filter
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                        onClick={() => setShowFilters(false)}
                    />
                    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 lg:hidden max-h-[80vh] overflow-y-auto">
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="font-semibold text-neutral-800">Filter</h3>
                            <button onClick={() => setShowFilters(false)}>
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Categories */}
                            <div>
                                <h4 className="font-medium text-neutral-700 mb-3">Kategori</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`px-4 py-2 rounded-full border transition-colors ${selectedCategory === ''
                                            ? 'bg-primary-500 text-white border-primary-500'
                                            : 'border-neutral-200'
                                            }`}
                                    >
                                        Semua
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.slug)}
                                            className={`px-4 py-2 rounded-full border transition-colors ${selectedCategory === category.slug
                                                ? 'bg-primary-500 text-white border-primary-500'
                                                : 'border-neutral-200'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="secondary"
                                    onClick={clearFilters}
                                    className="flex-1"
                                >
                                    Reset
                                </Button>
                                <Button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1"
                                >
                                    Terapkan
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

export default function ProductsPage() {
    return (
        <>
            <Header />
            <CartDrawer />
            <Suspense fallback={
                <main className="flex-1 bg-neutral-50 flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                </main>
            }>
                <ProductsContent />
            </Suspense>
            <Footer />
        </>
    );
}

