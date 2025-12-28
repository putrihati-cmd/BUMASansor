'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button, Input } from '@/components/ui';
import useCartStore from '@/store/cart';
import { formatRupiah } from '@/lib/utils';

export default function CartPage() {
    const { items, removeItem, increaseQuantity, decreaseQuantity, getTotal, clearCart } = useCartStore();
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherApplied, setVoucherApplied] = useState(null);

    const subtotal = getTotal();
    const discount = voucherApplied ? Math.min(subtotal * 0.1, 50000) : 0; // Max 50k discount
    const total = subtotal - discount;

    const handleApplyVoucher = () => {
        if (voucherCode.toUpperCase() === 'PERTAMA') {
            setVoucherApplied({
                code: 'PERTAMA',
                discount: 10,
                message: 'Diskon 10% diterapkan (max Rp50.000)'
            });
        } else {
            alert('Kode voucher tidak valid');
        }
    };

    if (items.length === 0) {
        return (
            <>
                <Header />
                <CartDrawer />
                <main className="flex-1 bg-neutral-50">
                    <div className="container-app py-20">
                        <div className="max-w-md mx-auto text-center">
                            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-12 h-12 text-neutral-300" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Keranjang Kosong</h1>
                            <p className="text-neutral-500 mb-6">
                                Yuk, mulai belanja dan temukan produk favoritmu!
                            </p>
                            <Link href="/products">
                                <Button size="lg">
                                    <ShoppingCart className="w-5 h-5" />
                                    Mulai Belanja
                                </Button>
                            </Link>
                        </div>
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
                {/* Page Header */}
                <div className="bg-white border-b border-neutral-100">
                    <div className="container-app py-6">
                        <Link href="/products" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Lanjut Belanja
                        </Link>
                        <h1 className="text-2xl font-bold text-neutral-800">Keranjang Belanja</h1>
                        <p className="text-neutral-500">{items.length} produk dalam keranjang</p>
                    </div>
                </div>

                <div className="container-app py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Select All */}
                            <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-neutral-800">
                                        {items.length} Produk
                                    </span>
                                </div>
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    Hapus Semua
                                </button>
                            </div>

                            {/* Items */}
                            <div className="bg-white rounded-xl divide-y divide-neutral-100">
                                {items.map((item) => (
                                    <div key={item.id} className="p-4 md:p-6">
                                        <div className="flex gap-4">
                                            {/* Image */}
                                            <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-neutral-100">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </Link>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/products/${item.productId}`}>
                                                    <h3 className="font-semibold text-neutral-800 hover:text-primary-500 line-clamp-2 mb-1">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                {item.variantName && (
                                                    <p className="text-sm text-neutral-500 mb-2">Varian: {item.variantName}</p>
                                                )}

                                                {/* Price */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="font-bold text-primary-500">
                                                        {formatRupiah(item.salePrice || item.basePrice)}
                                                    </span>
                                                    {item.salePrice && (
                                                        <span className="text-sm text-neutral-400 line-through">
                                                            {formatRupiah(item.basePrice)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {/* Quantity */}
                                                        <div className="flex items-center border-2 border-neutral-200 rounded-lg">
                                                            <button
                                                                onClick={() => decreaseQuantity(item.id)}
                                                                disabled={item.quantity <= 1}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => increaseQuantity(item.id)}
                                                                disabled={item.quantity >= item.stock}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {/* Item Total */}
                                                    <p className="font-bold text-neutral-800">
                                                        {formatRupiah((item.salePrice || item.basePrice) * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-neutral-800 mb-6">Ringkasan Belanja</h2>

                                {/* Voucher */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Kode Voucher
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value)}
                                            placeholder="Masukkan kode"
                                            leftIcon={<Tag className="w-4 h-4" />}
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={handleApplyVoucher}
                                            className="flex-shrink-0"
                                        >
                                            Pakai
                                        </Button>
                                    </div>
                                    {voucherApplied && (
                                        <p className="text-sm text-secondary-500 mt-2">{voucherApplied.message}</p>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Subtotal ({items.length} produk)</span>
                                        <span className="font-medium text-neutral-800">{formatRupiah(subtotal)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-secondary-500">
                                            <span>Diskon Voucher</span>
                                            <span>-{formatRupiah(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-neutral-400 text-sm">
                                        <span>Ongkos Kirim</span>
                                        <span>Dihitung saat checkout</span>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-neutral-800">Total</span>
                                        <span className="text-xl font-bold text-primary-500">{formatRupiah(total)}</span>
                                    </div>
                                </div>

                                <Link href="/checkout">
                                    <Button fullWidth size="lg">
                                        Checkout ({items.length})
                                    </Button>
                                </Link>

                                <p className="text-xs text-neutral-400 text-center mt-4">
                                    Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

