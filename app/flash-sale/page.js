'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Clock, ShoppingCart, ArrowLeft, Flame, Timer } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart';
import { formatRupiah } from '@/lib/utils';
import useCartStore from '@/store/cart';

// Mock data for flash sale products (when no active flash sale in DB)
const mockFlashSaleProducts = [
    {
        id: 'fs-1',
        name: 'Kurma Ajwa Madinah Premium 500gr',
        slug: 'kurma-ajwa-madinah-premium-500gr',
        image: 'https://via.placeholder.com/400x400/EE4D2D/ffffff?text=Kurma+Ajwa',
        originalPrice: 350000,
        salePrice: 245000,
        discountPercent: 30,
        stockLimit: 50,
        soldCount: 38,
        stockLeft: 12,
    },
    {
        id: 'fs-2',
        name: 'Air Zamzam Asli 5 Liter',
        slug: 'air-zamzam-asli-5-liter',
        image: 'https://via.placeholder.com/400x400/3B82F6/ffffff?text=Zamzam+5L',
        originalPrice: 250000,
        salePrice: 175000,
        discountPercent: 30,
        stockLimit: 100,
        soldCount: 67,
        stockLeft: 33,
    },
    {
        id: 'fs-3',
        name: 'Kurma Sukari Basah 1kg',
        slug: 'kurma-sukari-basah-1kg',
        image: 'https://via.placeholder.com/400x400/F59E0B/ffffff?text=Sukari+1kg',
        originalPrice: 180000,
        salePrice: 126000,
        discountPercent: 30,
        stockLimit: 80,
        soldCount: 45,
        stockLeft: 35,
    },
    {
        id: 'fs-4',
        name: 'Madu Hutan Asli 500ml',
        slug: 'madu-hutan-asli-500ml',
        image: 'https://via.placeholder.com/400x400/10B981/ffffff?text=Madu+Hutan',
        originalPrice: 150000,
        salePrice: 99000,
        discountPercent: 34,
        stockLimit: 60,
        soldCount: 52,
        stockLeft: 8,
    },
    {
        id: 'fs-5',
        name: 'Paket Oleh-Oleh Haji Lengkap',
        slug: 'paket-oleh-oleh-haji-lengkap',
        image: 'https://via.placeholder.com/400x400/8B5CF6/ffffff?text=Paket+Haji',
        originalPrice: 500000,
        salePrice: 350000,
        discountPercent: 30,
        stockLimit: 30,
        soldCount: 22,
        stockLeft: 8,
    },
    {
        id: 'fs-6',
        name: 'Kacang Arab Premium 500gr',
        slug: 'kacang-arab-premium-500gr',
        image: 'https://via.placeholder.com/400x400/EC4899/ffffff?text=Kacang+Arab',
        originalPrice: 85000,
        salePrice: 59000,
        discountPercent: 31,
        stockLimit: 100,
        soldCount: 78,
        stockLeft: 22,
    },
];

function CountdownTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff > 0) {
                setTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-white" />
            <div className="flex gap-1">
                <span className="bg-black text-white px-2 py-1 rounded font-mono font-bold text-lg min-w-[40px] text-center">
                    {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-white font-bold text-lg">:</span>
                <span className="bg-black text-white px-2 py-1 rounded font-mono font-bold text-lg min-w-[40px] text-center">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-white font-bold text-lg">:</span>
                <span className="bg-black text-white px-2 py-1 rounded font-mono font-bold text-lg min-w-[40px] text-center">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

function FlashSaleProductCard({ product }) {
    const addItem = useCartStore((state) => state.addItem);
    const stockPercent = ((product.stockLimit - product.stockLeft) / product.stockLimit) * 100;

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            images: [product.image],
            basePrice: product.originalPrice,
            salePrice: product.sale_price,
            stock: product.stockLeft,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {product.discountPercent}% OFF
                </div>
                {/* Stock Warning */}
                {product.stockLeft <= 10 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        Sisa {product.stockLeft}!
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2 hover:text-orange-500 transition-colors min-h-[40px]">
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="mb-3">
                    <p className="text-lg font-bold text-red-500">
                        {formatRupiah(product.sale_price)}
                    </p>
                    <p className="text-sm text-gray-400 line-through">
                        {formatRupiah(product.originalPrice)}
                    </p>
                </div>

                {/* Stock Progress */}
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {product.soldCount} terjual
                        </span>
                        <span>Tersisa {product.stockLeft}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300"
                            style={{ width: `${stockPercent}%` }}
                        />
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stockLeft === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stockLeft === 0 ? 'Habis' : 'Beli Sekarang'}
                </button>
            </div>
        </div>
    );
}

export default function FlashSalePage() {
    const [flashSaleData, setFlashSaleData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFlashSale() {
            try {
                setLoading(true);
                const res = await fetch('/api/flash-sale');
                const data = await res.json();

                if (data.active && data.products?.length > 0) {
                    setFlashSaleData(data.flashSale);
                    setProducts(data.products);
                } else {
                    // Use mock data if no active flash sale
                    setFlashSaleData({
                        name: 'Flash Sale Spesial',
                        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
                    });
                    setProducts(mockFlashSaleProducts);
                }
            } catch (err) {
                console.error('Error fetching flash sale:', err);
                setError('Gagal memuat data flash sale');
                // Fallback to mock data
                setFlashSaleData({
                    name: 'Flash Sale Spesial',
                    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                });
                setProducts(mockFlashSaleProducts);
            } finally {
                setLoading(false);
            }
        }

        fetchFlashSale();
    }, []);

    return (
        <>
            <Header />
            <CartDrawer />

            <main className="min-h-screen bg-gray-50">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-secondary-600 via-secondary-500 to-secondary-400 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                        <div className="absolute bottom-5 right-20 w-20 h-20 bg-white rounded-full"></div>
                        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
                    </div>

                    <div className="container-app py-8 md:py-12 relative z-10">
                        {/* Back Button */}
                        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Zap className="w-8 h-8 md:w-10 md:h-10 text-yellow-300 animate-pulse" />
                                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                        FLASH SALE
                                    </h1>
                                    <Zap className="w-8 h-8 md:w-10 md:h-10 text-yellow-300 animate-pulse" />
                                </div>
                                <p className="text-white/90 text-lg">
                                    Diskon hingga 50%! Stok terbatas, buruan checkout!
                                </p>
                            </div>

                            {/* Countdown */}
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-white/80 text-sm mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Berakhir dalam
                                </p>
                                {flashSaleData && (
                                    <CountdownTimer endTime={flashSaleData.endTime} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="container-app py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Product Count */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-gray-600">
                                    <span className="font-semibold text-gray-800">{products.length}</span> produk flash sale
                                </p>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                {products.map((product) => (
                                    <FlashSaleProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Info Banner */}
                            <div className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-orange-500" />
                                    Syarat & Ketentuan Flash Sale
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Harga khusus berlaku selama periode Flash Sale</li>
                                    <li>• Stok terbatas, tidak dapat digabung dengan promo lain</li>
                                    <li>• Maksimal pembelian 2 pcs per produk per akun</li>
                                    <li>• Produk tidak dapat dikembalikan kecuali cacat produksi</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

