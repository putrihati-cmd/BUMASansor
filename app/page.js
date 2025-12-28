'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw, CheckCircle2, RefreshCw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { ProductCard, RecentlyViewedProducts } from '@/components/product';

// Import Components
import {
    BannerCarousel,
    QuickAccessMenu,
    CategoryIconGrid,
    FlashSaleSection
} from '@/components/home';

// Trust Badges - Text Only Strip for Clean Look
function TrustBadges() {
    const badges = [
        { icon: ShieldCheck, title: '100% Original' },
        { icon: CheckCircle2, title: 'Kualitas Terjamin' },
        { icon: Truck, title: 'Gratis Ongkir' },
        { icon: RotateCcw, title: '100% Aman' },
    ];

    return (
        <div className="flex items-center justify-between md:justify-center md:gap-12 px-2 py-2 border-t border-gray-100 mt-2">
            {badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-1.5 text-gray-500">
                    <badge.icon className="w-3.5 h-3.5 text-primary-500" />
                    <span className="text-[10px] md:text-xs font-medium tracking-wide">{badge.title}</span>
                </div>
            ))}
        </div>
    );
}

// Product Grid Section
function ProductGridSection({ title, subtitle, products = [], showViewAll = true, bg = "bg-transparent", loading = false }) {
    if (loading) {
        return (
            <section className={`py-6 mb-4 ${bg}`}>
                <div className={`flex items-end justify-between mb-4 ${bg === 'bg-white' ? 'px-3 pt-3 md:px-4 md:pt-4' : 'px-1'}`}>
                    <div>
                        <h2 className="text-base md:text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary-500 rounded-full block"></span>
                            {title}
                        </h2>
                    </div>
                </div>
                <div className={`flex items-center justify-center py-12 ${bg === 'bg-white' ? 'px-3 pb-3 md:px-4 md:pb-6' : ''}`}>
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            </section>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <section className={`py-6 mb-4 ${bg}`}>
            <div className={`flex items-end justify-between mb-4 ${bg === 'bg-white' ? 'px-3 pt-3 md:px-4 md:pt-4' : 'px-1'}`}>
                <div>
                    <h2 className="text-base md:text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary-500 rounded-full block"></span>
                        {title}
                    </h2>
                    {subtitle && <p className="text-xs text-gray-500 mt-1 pl-4 hidden md:block">{subtitle}</p>}
                </div>
                {showViewAll && (
                    <Link href="/products" className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline uppercase mr-1">
                        Lihat Semua
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
            </div>

            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 ${bg === 'bg-white' ? 'px-3 pb-3 md:px-4 md:pb-6' : ''}`}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch featured products
                const featuredRes = await fetch('/api/products?featured=true&limit=12');

                if (!featuredRes.ok) {
                    console.error('Featured products fetch failed:', featuredRes.status);
                }

                const featuredData = await featuredRes.json();

                // If no featured products, fetch regular products
                if (!featuredData.products || featuredData.products.length === 0) {
                    console.log('No featured products, fetching all products');
                    const fallbackRes = await fetch('/api/products?limit=12');
                    const fallbackData = await fallbackRes.json();
                    setFeaturedProducts(fallbackData.products || []);
                } else {
                    setFeaturedProducts(featuredData.products || []);
                }

                // Fetch all products for recommendations
                const allRes = await fetch('/api/products?limit=18');
                const allData = await allRes.json();

                setAllProducts(allData.products || []);
            } catch (error) {
                console.error('Error fetching products:', error);
                // Set empty arrays on error
                setFeaturedProducts([]);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
            <Header />
            <CartDrawer />

            <main className="flex-1">
                {/* 
                  SECTION 1: HERO CONTAINER 
                  Background putih memanjang dari atas sampai bawah menu
                */}
                <div className="bg-white shadow-sm mb-3 pb-2">
                    <div className="container-app pt-4 px-2 md:px-0">
                        {/* Banner Carousel */}
                        <div className="rounded-xl overflow-hidden shadow-sm mb-4">
                            <BannerCarousel />
                        </div>

                        {/* Quick Access Menu - Full Row */}
                        <div className="mb-2 px-1">
                            <QuickAccessMenu />
                        </div>

                        {/* Trust Badges Strip */}
                        <TrustBadges />
                    </div>
                </div>

                {/* 
                  SECTION 2: FLASH SALE 
                  Independent container, full attention 
                */}
                <div className="container-app mb-4 px-2 md:px-0">
                    <FlashSaleSection />
                </div>

                {/* 
                  SECTION 3: CATEGORIES
                  Boxed white style
                */}
                <div className="container-app mb-4 px-2 md:px-0">
                    <div className="bg-white rounded border border-gray-100 p-3 md:p-5">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                            <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide">KATEGORI PILIHAN</h3>
                            <Link href="/categories" className="text-xs font-bold text-primary-600 hover:underline">Lihat Semua</Link>
                        </div>
                        <CategoryIconGrid />
                    </div>
                </div>

                {/* 
                  SECTION 4: PRODUCTS
                */}
                <div className="container-app space-y-4 px-2 md:px-0 pb-10">
                    {/* Featured Products (Boxed White) */}
                    <div className="bg-white rounded border border-gray-100 overflow-hidden">
                        <ProductGridSection
                            title="PALING LARIS"
                            subtitle="Produk yang paling banyak diburu"
                            products={featuredProducts}
                            bg="bg-white"
                            loading={loading}
                        />
                    </div>

                    {/* Recently Viewed */}
                    <RecentlyViewedProducts />

                    {/* All Products (Transparent) */}
                    <ProductGridSection
                        title="REKOMENDASI UNTUKMU"
                        products={allProducts}
                        loading={loading}
                    />

                    {/* Load More Button */}
                    <div className="flex justify-center mt-4">
                        <Link href="/products">
                            <button className="bg-white text-gray-700 border border-gray-300 hover:border-primary-500 hover:text-primary-600 px-8 py-2 md:px-16 md:py-3 rounded-full font-semibold transition-all shadow-sm text-sm tracking-wide hover:shadow-md">
                                Muat Lebih Banyak
                            </button>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}


