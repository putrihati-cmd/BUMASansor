'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

// Countdown Timer - White Theme for Colored Background
function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 2);

        const calculateTimeLeft = () => {
            const difference = endTime - new Date();
            if (difference > 0) {
                return {
                    hours: Math.floor(difference / (1000 * 60 * 60)),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num) => String(num).padStart(2, '0');

    return (
        <div className="flex items-center gap-1">
            <div className="bg-white text-secondary-500 px-2 py-1 rounded font-bold text-sm min-w-[30px] text-center shadow-sm">
                {formatNumber(timeLeft.hours)}
            </div>
            <span className="text-white font-bold text-sm">:</span>
            <div className="bg-white text-secondary-500 px-2 py-1 rounded font-bold text-sm min-w-[30px] text-center shadow-sm">
                {formatNumber(timeLeft.minutes)}
            </div>
            <span className="text-white font-bold text-sm">:</span>
            <div className="bg-white text-secondary-500 px-2 py-1 rounded font-bold text-sm min-w-[30px] text-center shadow-sm">
                {formatNumber(timeLeft.seconds)}
            </div>
        </div>
    );
}

// Flash Sale Product Card - White Card on Colored BG
function FlashSaleProductCard({ product }) {
    const soldPercent = Math.min(Math.round((product.soldCount ?? 50) / 100 * 100), 100);
    const salePrice = product.sale_price || Math.round(Number(product.base_price) * 0.7);
    const basePrice = Number(product.base_price);
    const discount = Math.round((1 - salePrice / basePrice) * 100);

    return (
        <Link href={`/products/${product.slug}`} className="block bg-white rounded overflow-hidden border border-gray-200/80 hover:border-gray-300 transition-all duration-200 h-full group">
            {/* Image */}
            <div className="relative aspect-square bg-gray-50">
                <Image
                    src={product.images?.[0] || '/api/placeholder/400'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="160px"
                />
                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-0 right-0 bg-primary-200 text-primary-700 w-8 h-8 flex flex-col items-center justify-center rounded-bl-lg font-bold leading-none shadow-sm">
                        <span className="text-[9px]">{discount}%</span>
                        <span className="text-[6px] uppercase">OFF</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-2 h-full flex flex-col justify-end">
                <p className="text-[10px] md:text-xs font-medium text-gray-700 line-clamp-1 mb-1" title={product.name}>
                    {product.name}
                </p>
                <div className="flex flex-col mb-1">
                    <p className="text-sm font-bold text-primary-600 leading-none mb-0.5">{formatRupiah(salePrice)}</p>
                    <p className="text-[9px] text-gray-400 line-through leading-none">{formatRupiah(basePrice)}</p>
                </div>

                {/* Fire Progress Bar */}
                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100/50">
                    <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-secondary-500 to-secondary-300"
                        style={{ width: `${soldPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <span className="text-[8px] font-bold text-white drop-shadow-md uppercase tracking-wide">
                            {soldPercent >= 90 ? 'Segera Habis' : `${soldPercent} Terjual`}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function FlashSaleSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products?limit=6&featured=true');
                const data = await res.json();
                // Calculate sold percentage dynamically based on stock (simulate flash sale pressure)
                const productsWithSales = (data.products || []).map((p) => {
                    const totalStock = p.stock + 100; // Simulate original stock
                    const currentStock = p.stock;
                    const soldCount = totalStock - currentStock;
                    const soldPercent = Math.round((soldCount / totalStock) * 100);

                    return {
                        ...p,
                        soldCount,
                        soldPercent,
                        salePrice: p.sale_price || p.sale_price || Math.round(Number(p.base_price || p.base_price) * 0.8)
                    };
                });
                setProducts(productsWithSales);
            } catch (error) {
                console.error('Error fetching flash sale products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="rounded overflow-hidden relative my-3">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 via-secondary-500 to-secondary-400 z-0"></div>
                <div className="relative z-10 p-6 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="rounded overflow-hidden relative my-3">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 via-secondary-500 to-secondary-400 z-0"></div>

            {/* Decorative Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 z-0"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-10 -mb-10 z-0"></div>

            <div className="relative z-10 p-3 md:p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 md:w-7 md:h-7 text-white fill-white animate-pulse" />
                            <h2 className="text-xl md:text-2xl font-black italic text-white tracking-wider drop-shadow-sm">FLASH SALE</h2>
                        </div>
                        <CountdownTimer />
                    </div>

                    <Link
                        href="/flash-sale"
                        className="flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white transition-colors bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    >
                        Lihat Semua
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-3 px-3 md:mx-0 md:px-0">
                    {products.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                            <FlashSaleProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

