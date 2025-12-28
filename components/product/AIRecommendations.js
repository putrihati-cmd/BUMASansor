'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * AI-Powered Smart Recommendations Component
 * Uses the new AI recommendations API for personalized suggestions
 */
export default function AIRecommendations({
    title = 'Pilihan Khusus Untuk Anda',
    productId = null,
    categoryId = null,
    context = 'homepage',
    type = 'recommendations',
    limit = 8,
    showBadge = true,
    className = ''
}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [algorithm, setAlgorithm] = useState('');

    useEffect(() => {
        fetchRecommendations();
    }, [productId, categoryId, context, type]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                context,
                type,
                limit: limit.toString()
            });

            if (productId) params.append('productId', productId);
            if (categoryId) params.append('categoryId', categoryId);

            const res = await fetch(`/api/ai/recommendations?${params}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.recommendations || []);
                setAlgorithm(data.algorithm || '');
            }
        } catch (error) {
            console.error('Error fetching AI recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getAlgorithmLabel = () => {
        switch (algorithm) {
            case 'personalized': return '✨ Dipilih khusus untuk Anda';
            case 'similar': return '🔍 Produk serupa';
            case 'collaborative': return '🛒 Yang lain juga beli';
            case 'popular': return '🔥 Sedang populer';
            default: return '';
        }
    };

    if (loading) {
        return (
            <section className={`py-6 ${className}`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="h-5 bg-amber-200 rounded-full w-12 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-3 animate-pulse border border-gray-100">
                                <div className="aspect-square bg-gray-100 rounded-lg mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-1"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className={`py-6 ${className}`}>
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            {title}
                        </h2>
                        {showBadge && (
                            <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <span>✨</span> AI
                            </span>
                        )}
                    </div>
                    {getAlgorithmLabel() && (
                        <span className="text-xs text-gray-500 hidden md:block">
                            {getAlgorithmLabel()}
                        </span>
                    )}
                </div>

                {/* Products Horizontal Scroll on Mobile, Grid on Desktop */}
                <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="flex-shrink-0 w-[45%] md:w-auto group bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all overflow-hidden"
                        >
                            {/* Image */}
                            <div className="aspect-square relative overflow-hidden bg-gray-50">
                                {product.images && product.images[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Sale Badge */}
                                {product.sale_price && product.sale_price < product.base_price && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                                        {Math.round((1 - product.sale_price / product.base_price) * 100)}% OFF
                                    </div>
                                )}

                                {/* AI Pick Badge */}
                                {algorithm === 'personalized' && (
                                    <div className="absolute top-2 right-2 bg-gradient-to-r from-teal-500 to-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <span>✨</span> AI Pick
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                {/* Category */}
                                {product.categoryName && (
                                    <p className="text-[10px] text-teal-600 uppercase tracking-wide mb-0.5">
                                        {product.categoryName}
                                    </p>
                                )}

                                {/* Name */}
                                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-teal-600 transition min-h-[2.5rem]">
                                    {product.name}
                                </h3>

                                {/* Rating */}
                                {product.rating > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-amber-400 text-xs">★</span>
                                        <span className="text-xs text-gray-600">{product.rating}</span>
                                        {product.reviewCount > 0 && (
                                            <span className="text-xs text-gray-400">({product.reviewCount})</span>
                                        )}
                                    </div>
                                )}

                                {/* Price */}
                                <div className="mt-2">
                                    {product.sale_price ? (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-sm font-bold text-teal-600">
                                                {formatPrice(product.sale_price)}
                                            </span>
                                            <span className="text-xs text-gray-400 line-through">
                                                {formatPrice(product.base_price)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-800">
                                            {formatPrice(product.base_price)}
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
