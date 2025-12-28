'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Clock, Truck, Check, ChevronRight, Search, RotateCcw, RefreshCw } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button, Badge } from '@/components/ui';
import { formatRupiah, formatDate } from '@/lib/utils';
import useCartStore from '@/store/cart';
import useUserStore from '@/store/user';

const statusConfig = {
    PENDING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'warning', icon: Clock },
    PAID: { label: 'Dibayar', color: 'primary', icon: Check },
    PROCESSING: { label: 'Sedang Diproses', color: 'primary', icon: Package },
    SHIPPED: { label: 'Dalam Pengiriman', color: 'primary', icon: Truck },
    DELIVERED: { label: 'Diterima', color: 'success', icon: Check },
    COMPLETED: { label: 'Selesai', color: 'success', icon: Check },
    CANCELLED: { label: 'Dibatalkan', color: 'danger', icon: Clock },
    FAILED: { label: 'Gagal', color: 'danger', icon: Clock },
};

const tabs = [
    { value: '', label: 'Semua' },
    { value: 'PENDING_PAYMENT', label: 'Belum Bayar' },
    { value: 'PROCESSING', label: 'Diproses' },
    { value: 'SHIPPED', label: 'Dikirim' },
    { value: 'COMPLETED', label: 'Selesai' },
];

export default function OrdersPage() {
    const { isAuthenticated } = useUserStore();
    const { addItem, openCart } = useCartStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const fetchOrders = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });
            if (activeTab) params.append('status', activeTab);

            const res = await fetch(`/api/orders?${params}`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
                setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, fetchOrders]);

    // Filter orders by search in frontend
    const filteredOrders = orders.filter((order) => {
        return order.orderNumber.toLowerCase().includes(search.toLowerCase());
    });

    const handleReorder = (order) => {
        // Add all items from order to cart
        order.items.forEach(item => {
            const product = item.product || {};
            const cartProduct = {
                id: item.productId,
                name: item.productName,
                basePrice: Number(item.priceAtPurchase),
                stock: 99, // Assume available
                images: product.images || []
            };
            addItem(cartProduct, null, item.quantity);
        });

        openCart();
        alert('Produk berhasil ditambahkan ke keranjang!');
    };

    if (!isAuthenticated) {
        return (
            <>
                <Header />
                <CartDrawer />
                <main className="flex-1 bg-neutral-50 flex items-center justify-center">
                    <div className="text-center px-4">
                        <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-neutral-800 mb-2">
                            Pesanan Saya
                        </h1>
                        <p className="text-neutral-500 mb-6">
                            Masuk untuk melihat pesanan
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
                        <h1 className="text-2xl font-bold text-neutral-800">Pesanan Saya</h1>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm mb-6">
                        <div className="flex overflow-x-auto hide-scrollbar border-b border-neutral-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={`px-6 py-4 font-medium whitespace-nowrap transition-colors relative ${activeTab === tab.value
                                        ? 'text-primary-500'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.value && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="p-4 flex items-center gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nomor pesanan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => fetchOrders()} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <RefreshCw className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
                            <p className="text-neutral-500">Memuat pesanan...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => {
                                const StatusIcon = statusConfig[order.status]?.icon || Package;
                                const statusLabel = statusConfig[order.status]?.label || order.status;
                                const statusColor = statusConfig[order.status]?.color || 'secondary';

                                return (
                                    <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                        {/* Order Header */}
                                        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <StatusIcon className="w-5 h-5 text-primary-500" />
                                                <div>
                                                    <p className="font-semibold text-neutral-800">{order.orderNumber}</p>
                                                    <p className="text-sm text-neutral-500">
                                                        {formatDate(order.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={statusColor}>
                                                {statusLabel}
                                            </Badge>
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-4">
                                            {order.items.map((item, index) => {
                                                const product = item.product || {};
                                                const images = Array.isArray(product.images) ? product.images : [];
                                                const imageUrl = images[0] || '/placeholder-product.jpg';

                                                return (
                                                    <div key={item.id || index} className={`flex gap-4 ${index > 0 ? 'mt-4 pt-4 border-t border-neutral-100' : ''}`}>
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                                                            <Image
                                                                src={imageUrl}
                                                                alt={item.productName}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            {product.slug ? (
                                                                <Link href={`/products/${product.slug}`}>
                                                                    <p className="font-medium text-neutral-800 hover:text-primary-500">{item.productName}</p>
                                                                </Link>
                                                            ) : (
                                                                <p className="font-medium text-neutral-800">{item.productName}</p>
                                                            )}
                                                            {item.variantName && (
                                                                <p className="text-xs text-neutral-400">{item.variantName}</p>
                                                            )}
                                                            <p className="text-sm text-neutral-500">{item.quantity} x {formatRupiah(Number(item.priceAtPurchase))}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="p-4 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-neutral-500">Total Pesanan</p>
                                                <p className="text-lg font-bold text-primary-500">{formatRupiah(Number(order.total))}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {order.status === 'COMPLETED' && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleReorder(order)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                        Beli Lagi
                                                    </Button>
                                                )}
                                                <Link href={`/account/orders/${order.id}`}>
                                                    <Button size="sm">
                                                        Lihat Detail
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.page <= 1}
                                        onClick={() => fetchOrders(pagination.page - 1)}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <span className="px-4 py-2 text-sm text-neutral-500">
                                        Halaman {pagination.page} dari {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={pagination.page >= pagination.totalPages}
                                        onClick={() => fetchOrders(pagination.page + 1)}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Belum ada pesanan</h3>
                            <p className="text-neutral-500 mb-6">Yuk mulai belanja dan temukan produk favoritmu!</p>
                            <Link href="/products">
                                <Button>Mulai Belanja</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

