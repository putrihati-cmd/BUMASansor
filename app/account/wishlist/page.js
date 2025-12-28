'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star, RefreshCw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button } from '@/components/ui';
import { formatRupiah, calculateDiscountPercentage } from '@/lib/utils';
import useCartStore from '@/store/cart';
import useUserStore from '@/store/user';

export default function WishlistPage() {
    const { isAuthenticated } = useUserStore();
    const { addItem, openCart } = useCartStore();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/wishlist', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setWishlist(data.data || []);
            }
        } catch (error) {
            console.error('Fetch wishlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            setRemoving(productId);
            const res = await fetch(`/api/wishlist?productId=${productId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                setWishlist(wishlist.filter((item) => item.productId !== productId));
            }
        } catch (error) {
            console.error('Remove from wishlist error:', error);
        } finally {
            setRemoving(null);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Yakin ingin menghapus semua item dari wishlist?')) return;

        // Remove one by one
        for (const item of wishlist) {
            await handleRemove(item.productId);
        }
    };

    const handleAddToCart = (item) => {
        const product = item.product;
        if (product) {
            addItem({
                id: product.id,
                name: product.name,
                basePrice: Number(product.basePrice),
                salePrice: product.salePrice ? Number(product.salePrice) : null,
                stock: product.stock,
                images: product.images || [],
            });
            openCart();
        }
    };

    if (!isAuthenticated) {
        return (
            <>
                <Header />
                <CartDrawer />
                <main className="flex-1 bg-neutral-50 flex items-center justify-center">
                    <div className="text-center px-4">
                        <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-neutral-800 mb-2">
                            Wishlist Saya
                        </h1>
                        <p className="text-neutral-500 mb-6">
                            Masuk untuk melihat wishlist
                        </p>
                        <Link href="/auth/login">
                            <Button>Masuk</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-50">
                <div className="container-app py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/account" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Akun
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-800">Wishlist Saya</h1>
                                <p className="text-neutral-500">{wishlist.length} produk favorit</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={fetchWishlist} disabled={loading}>
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                                {wishlist.length > 0 && (
                                    <Button variant="secondary" onClick={handleClearAll}>
                                        <Trash2 className="w-4 h-4" />
                                        Hapus Semua
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <RefreshCw className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
                            <p className="text-neutral-500">Memuat wishlist...</p>
                        </div>
                    ) : wishlist.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {wishlist.map((item) => {
                                const product = item.product;
                                if (!product) return null;

                                const basePrice = Number(product.basePrice);
                                const salePrice = product.salePrice ? Number(product.salePrice) : null;
                                const discountPercentage = salePrice
                                    ? calculateDiscountPercentage(basePrice, salePrice)
                                    : 0;
                                const images = Array.isArray(product.images) ? product.images : [];
                                const imageUrl = images[0] || '/placeholder-product.jpg';

                                return (
                                    <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                        {/* Image */}
                                        <Link href={`/products/${product.slug}`}>
                                            <div className="relative aspect-square overflow-hidden bg-neutral-100">
                                                <Image
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {discountPercentage > 0 && (
                                                    <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                                                        -{discountPercentage}%
                                                    </span>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemove(product.id);
                                                    }}
                                                    disabled={removing === product.id}
                                                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {removing === product.id ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Heart className="w-5 h-5 fill-current" />
                                                    )}
                                                </button>
                                            </div>
                                        </Link>

                                        {/* Content */}
                                        <div className="p-4">
                                            <Link href={`/products/${product.slug}`}>
                                                <h3 className="font-semibold text-neutral-800 line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {/* Category */}
                                            {product.category && (
                                                <p className="text-xs text-neutral-400 mb-2">{product.category.name}</p>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-4">
                                                {salePrice ? (
                                                    <>
                                                        <span className="text-lg font-bold text-primary-500">
                                                            {formatRupiah(salePrice)}
                                                        </span>
                                                        <span className="text-sm text-neutral-400 line-through">
                                                            {formatRupiah(basePrice)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold text-neutral-800">
                                                        {formatRupiah(basePrice)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <Button
                                                fullWidth
                                                onClick={() => handleAddToCart(item)}
                                                disabled={product.stock === 0}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Wishlist kosong</h3>
                            <p className="text-neutral-500 mb-6">Simpan produk favorit Anda di sini</p>
                            <Link href="/products">
                                <Button>Jelajahi Produk</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

