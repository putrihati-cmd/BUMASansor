'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw, Minus, Plus, ChevronLeft, ChevronRight, MessageCircle, Store, Ticket, X, Check, RefreshCw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { ProductCard } from '@/components/product';
import { Button, Badge } from '@/components/ui';
import { formatRupiah, calculateDiscountPercentage, formatSoldCount } from '@/lib/utils';
import useCartStore from '@/store/cart';

// Image Gallery Component
function ImageGallery({ images, productName, discountPercentage }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const safeImages = images && images.length > 0 ? images : ['/api/placeholder/400'];

    const goToPrev = () => setSelectedImage(prev => prev === 0 ? safeImages.length - 1 : prev - 1);
    const goToNext = () => setSelectedImage(prev => prev === safeImages.length - 1 ? 0 : prev + 1);

    return (
        <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                <Image
                    src={safeImages[selectedImage]}
                    alt={productName}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-br-lg">
                        -{discountPercentage}%
                    </div>
                )}

                {/* Navigation Arrows */}
                {safeImages.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {selectedImage + 1}/{safeImages.length}
                </div>
            </div>

            {/* Thumbnails */}
            {safeImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {safeImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary-500' : 'border-transparent'
                                }`}
                        >
                            <Image src={image} alt={`${productName} ${index + 1}`} fill className="object-cover" sizes="64px" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Store Info Component
function StoreInfo() {
    return (
        <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-neutral-800">Infiatin Store</h3>
                    <p className="text-xs text-neutral-500">Online • Sidareja, Cilacap</p>
                </div>
                <Link href="/about">
                    <Button variant="secondary" size="sm">Kunjungi Toko</Button>
                </Link>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 text-sm">
                <div>
                    <span className="font-semibold text-primary-500">4.9</span>
                    <span className="text-neutral-500 ml-1">Rating</span>
                </div>
                <div className="w-px h-4 bg-neutral-200" />
                <div>
                    <span className="font-semibold text-neutral-800">98%</span>
                    <span className="text-neutral-500 ml-1">Respons</span>
                </div>
                <div className="w-px h-4 bg-neutral-200" />
                <div>
                    <span className="font-semibold text-neutral-800">±1 Jam</span>
                    <span className="text-neutral-500 ml-1">Balas</span>
                </div>
            </div>
        </div>
    );
}

// Sticky Buy Bar (Mobile)
function StickyBuyBar({ onAddToCart, onBuyNow }) {
    return (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-neutral-200 p-3 lg:hidden z-40 safe-area-pb">
            <div className="flex items-center gap-3">
                <button className="p-3 border border-neutral-200 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-primary-500" />
                </button>
                <button className="p-3 border border-neutral-200 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-primary-500" />
                </button>
                <Button variant="secondary" onClick={onAddToCart} className="flex-1">
                    + Keranjang
                </Button>
                <Button onClick={onBuyNow} className="flex-1">
                    Beli
                </Button>
            </div>
        </div>
    );
}

// Share Modal Component
function ShareModal({ isOpen, onClose, product }) {
    const [copied, setCopied] = useState(false);
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `${product.name} - ${formatRupiah(product.sale_price || product.base_price)}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(productUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToWhatsApp = () => {
        const text = encodeURIComponent(`🛍️ ${shareText}\n\nCek produk ini: ${productUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    };

    const shareToTwitter = () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(productUrl)}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Bagikan Produk</h3>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    {/* WhatsApp */}
                    <button
                        onClick={shareToWhatsApp}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium">WhatsApp</span>
                    </button>

                    {/* Facebook */}
                    <button
                        onClick={shareToFacebook}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </div>
                        <span className="font-medium">Facebook</span>
                    </button>

                    {/* Twitter */}
                    <button
                        onClick={shareToTwitter}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-sky-500 hover:bg-sky-50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                        </div>
                        <span className="font-medium">Twitter</span>
                    </button>

                    {/* Copy Link */}
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
                            {copied ? <Check className="w-6 h-6 text-green-600" /> : <Share2 className="w-6 h-6 text-neutral-600" />}
                        </div>
                        <span className="font-medium">{copied ? 'Link Tersalin!' : 'Salin Link'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showShareModal, setShowShareModal] = useState(false);
    const { addItem, openCart } = useCartStore();

    // Fetch product by slug
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/products/${params.slug}`);
                const data = await res.json();
                if (data.product) {
                    setProduct(data.product);
                    // Fetch related products
                    if (data.product.categoryId) {
                        const relatedRes = await fetch(`/api/products?category=${data.product.category?.slug || ''}&limit=6`);
                        const relatedData = await relatedRes.json();
                        setRelatedProducts((relatedData.products || []).filter(p => p.id !== data.product.id));
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        if (params.slug) {
            fetchProduct();
        }
    }, [params.slug]);

    // Track recently viewed products
    useEffect(() => {
        if (!product) return;

        const STORAGE_KEY = 'infiatin-recently-viewed';
        const MAX_ITEMS = 20;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const recentlyViewed = stored ? JSON.parse(stored) : [];

            const filtered = recentlyViewed.filter(item => item.id !== product.id);

            const updated = [
                {
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.images?.[0],
                    basePrice: product.base_price,
                    salePrice: product.sale_price,
                    viewedAt: new Date().toISOString()
                },
                ...filtered
            ].slice(0, MAX_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save recently viewed:', error);
        }
    }, [product]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="flex-1 flex items-center justify-center py-20 bg-neutral-50">
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                </main>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <main className="flex-1 flex items-center justify-center py-20 bg-neutral-50">
                    <div className="text-center px-4">
                        <h1 className="text-xl font-bold text-neutral-800 mb-4">
                            Produk tidak ditemukan
                        </h1>
                        <Link href="/products">
                            <Button>Kembali ke Produk</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const discountPercentage = calculateDiscountPercentage(product.base_price, product.sale_price);
    const currentPrice = product.sale_price || product.base_price;
    const soldCount = product.soldCount || (product.reviewCount || 0) * 10 || 100;

    const handleAddToCart = () => {
        addItem(product, selectedVariant, quantity);
        openCart();
    };

    const handleBuyNow = () => {
        addItem(product, selectedVariant, quantity);
        router.push('/checkout');
    };

    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-100">
                {/* Mobile Back Bar */}
                <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-neutral-100 flex items-center h-12 px-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ChevronLeft className="w-6 h-6 text-neutral-600" />
                    </button>
                    <span className="flex-1 text-center font-medium truncate">{product.name}</span>
                    <button onClick={() => setShowShareModal(true)} className="p-2 -mr-2">
                        <Share2 className="w-5 h-5 text-neutral-600" />
                    </button>
                </div>

                <div className="lg:container-app lg:py-6">
                    <div className="lg:grid lg:grid-cols-5 lg:gap-6">
                        {/* Left Column: Images */}
                        <div className="lg:col-span-2">
                            <div className="lg:sticky lg:top-24">
                                <ImageGallery
                                    images={product.images}
                                    productName={product.name}
                                    discountPercentage={discountPercentage}
                                />
                            </div>
                        </div>

                        {/* Middle Column: Product Info */}
                        <div className="lg:col-span-2 bg-white lg:bg-transparent">
                            <div className="p-4 lg:p-0 space-y-4">
                                {/* Price Section */}
                                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 -mx-4 lg:mx-0 lg:rounded-lg">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">{formatRupiah(currentPrice)}</span>
                                        {product.sale_price && (
                                            <span className="text-sm line-through text-white/70">
                                                {formatRupiah(product.base_price)}
                                            </span>
                                        )}
                                        {discountPercentage > 0 && (
                                            <span className="text-sm bg-yellow-400 text-red-600 px-2 py-0.5 rounded font-bold">
                                                -{discountPercentage}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-lg font-medium text-neutral-800 leading-snug">
                                    {product.name}
                                </h1>

                                {/* Rating & Sold */}
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="font-medium">{product.rating || 5}</span>
                                    </div>
                                    <span className="text-neutral-300">|</span>
                                    <span className="text-neutral-500">{product.reviewCount || 0} Penilaian</span>
                                    <span className="text-neutral-300">|</span>
                                    <span className="text-neutral-500">{formatSoldCount(soldCount)} Terjual</span>
                                </div>

                                {/* Voucher Banner */}
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <Ticket className="w-5 h-5 text-red-500" />
                                    <span className="text-sm text-red-600">Voucher Toko: Diskon Rp10.000</span>
                                    <button className="ml-auto text-sm text-red-500 font-medium">Klaim</button>
                                </div>

                                {/* Shipping Info */}
                                <div className="flex items-start gap-3 py-3 border-y border-neutral-100">
                                    <Truck className="w-5 h-5 text-neutral-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-800">Pengiriman ke <span className="font-medium">Jakarta</span></p>
                                        <p className="text-sm text-neutral-500">Ongkir Rp15.000 - Rp25.000</p>
                                        <p className="text-xs text-green-600 mt-1">🚚 Gratis Ongkir min. belanja Rp200.000</p>
                                    </div>
                                </div>

                                {/* Variants */}
                                {product.variants && product.variants.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-800 mb-3">Pilih Varian</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants.map((variant) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => setSelectedVariant(variant)}
                                                    disabled={variant.stock === 0}
                                                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${selectedVariant?.id === variant.id
                                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                                        : variant.stock === 0
                                                            ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                                            : 'border-neutral-200 hover:border-primary-300'
                                                        }`}
                                                >
                                                    {variant.name}
                                                    {variant.stock === 0 && ' (Habis)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity - Desktop */}
                                <div className="hidden lg:block">
                                    <h3 className="text-sm font-medium text-neutral-800 mb-3">Jumlah</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-neutral-200 rounded-lg">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-medium">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                                                disabled={quantity >= (product.stock || 99)}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-sm text-neutral-500">Stok: {product.stock || 99}</span>
                                    </div>
                                </div>

                                {/* Desktop Actions */}
                                <div className="hidden lg:flex gap-3 pt-4">
                                    <Button variant="secondary" onClick={handleAddToCart} className="flex-1">
                                        <ShoppingCart className="w-5 h-5" />
                                        Tambah ke Keranjang
                                    </Button>
                                    <Button onClick={handleBuyNow} className="flex-1">
                                        Beli Sekarang
                                    </Button>
                                </div>

                                {/* Trust Icons - Inline */}
                                <div className="flex items-center gap-4 py-3 text-xs text-neutral-500">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        <span>100% Original</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <RotateCcw className="w-4 h-4 text-green-500" />
                                        <span>7 Hari Return</span>
                                    </div>
                                </div>
                            </div>

                            {/* Store Info */}
                            <div className="mt-2 lg:mt-4">
                                <StoreInfo />
                            </div>
                        </div>

                        {/* Right Column: Sticky Cart Summary - Desktop */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24 bg-white rounded-lg p-4 border border-neutral-200">
                                <h3 className="font-semibold text-neutral-800 mb-4">Atur Jumlah</h3>

                                {/* Small Product Preview */}
                                <div className="flex gap-3 mb-4 pb-4 border-b border-neutral-100">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image src={product.images?.[0] || '/api/placeholder/400'} alt={product.name} fill className="object-cover" sizes="64px" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-neutral-800 line-clamp-2">{product.name}</p>
                                        {selectedVariant && (
                                            <p className="text-xs text-neutral-500 mt-1">Varian: {selectedVariant.name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center border border-neutral-200 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-neutral-500">Stok: {product.stock || 99}</span>
                                </div>

                                {/* Subtotal */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-neutral-600">Subtotal</span>
                                    <span className="text-lg font-bold text-neutral-800">{formatRupiah(Number(currentPrice) * quantity)}</span>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <Button onClick={handleAddToCart} variant="secondary" fullWidth>
                                        + Keranjang
                                    </Button>
                                    <Button onClick={handleBuyNow} fullWidth>
                                        Beli Sekarang
                                    </Button>
                                </div>

                                {/* Wishlist */}
                                <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-sm text-neutral-500 hover:text-red-500 transition-colors">
                                    <Heart className="w-4 h-4" />
                                    Tambah ke Wishlist
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="mt-2 lg:mt-6 bg-white lg:rounded-lg">
                        <div className="p-4">
                            <h2 className="font-semibold text-neutral-800 mb-3">Deskripsi Produk</h2>
                            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-2 lg:mt-6 bg-white lg:rounded-lg p-4">
                            <h2 className="font-semibold text-neutral-800 mb-4">Produk Serupa</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                {relatedProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Spacer for sticky buy bar */}
                <div className="h-20 lg:hidden" />
            </main>

            {/* Sticky Buy Bar - Mobile */}
            <StickyBuyBar onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />

            {/* Share Modal */}
            <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} product={product} />

            <Footer />
        </>
    );
}
