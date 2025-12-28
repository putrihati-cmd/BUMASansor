'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShoppingBag, TrendingUp } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export function ProductRecommendations({ productSlug, title = 'Rekomendasi Untuk Anda' }) {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('related');

    useEffect(() => {
        if (productSlug) {
            fetchRecommendations();
        }
    }, [productSlug]);

    const fetchRecommendations = async () => {
        try {
            const response = await fetch(`/api/products/${productSlug}/recommendations?limit=8`);
            const data = await response.json();

            if (data.success) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-8 bg-neutral-50">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-neutral-200 rounded w-64 mb-6" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-xl p-4">
                                    <div className="h-40 bg-neutral-200 rounded mb-4" />
                                    <div className="h-4 bg-neutral-200 rounded mb-2" />
                                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!recommendations) {
        return null;
    }

    const tabs = [
        { id: 'related', label: 'Produk Serupa', icon: Sparkles, data: recommendations.relatedProducts },
        { id: 'alsoBought', label: 'Yang Lain Juga Beli', icon: ShoppingBag, data: recommendations.alsoBought },
        { id: 'similar', label: 'Harga Mirip', icon: TrendingUp, data: recommendations.similarPrice },
    ];

    const activeData = tabs.find((t) => t.id === activeTab)?.data || [];

    if (activeData.length === 0 && recommendations.relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-8 bg-neutral-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>

                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const hasData = tab.data && tab.data.length > 0;

                            if (!hasData) return null;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-primary-500 text-white shadow-md'
                                            : 'bg-white text-neutral-600 hover:bg-primary-50 border border-neutral-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {activeData.slice(0, 5).map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100"
                        >
                            <div className="relative h-40 bg-neutral-100">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                        <Sparkles className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            <div className="p-3">
                                <h3 className="text-sm font-medium text-neutral-800 line-clamp-2 mb-2 group-hover:text-primary-600">
                                    {product.name}
                                </h3>

                                <div className="flex flex-col gap-1">
                                    {product.sale_price ? (
                                        <>
                                            <span className="text-base font-bold text-primary-600">
                                                {formatRupiah(product.sale_price)}
                                            </span>
                                            <span className="text-xs text-neutral-400 line-through">
                                                {formatRupiah(product.base_price)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-base font-bold text-neutral-800">
                                            {formatRupiah(product.base_price)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
