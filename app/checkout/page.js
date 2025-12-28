'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowLeft, MapPin, Truck, CreditCard, Check, ChevronRight } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import useCartStore from '@/store/cart';
import useUserStore from '@/store/user';
import { formatRupiah } from '@/lib/utils';

const shippingMethods = [
    { id: 'jne-reg', name: 'JNE Reguler', price: 15000, eta: '3-5 hari' },
    { id: 'jne-yes', name: 'JNE YES', price: 25000, eta: '1-2 hari' },
    { id: 'sicepat-best', name: 'SiCepat BEST', price: 18000, eta: '2-3 hari' },
    { id: 'jnt-ez', name: 'J&T Express', price: 16000, eta: '2-4 hari' },
];

const paymentMethods = [
    { id: 'bank-bca', name: 'Transfer Bank BCA', type: 'bank', logo: '🏦' },
    { id: 'bank-mandiri', name: 'Transfer Bank Mandiri', type: 'bank', logo: '🏦' },
    { id: 'qris', name: 'QRIS', type: 'ewallet', logo: '📱' },
    { id: 'gopay', name: 'GoPay', type: 'ewallet', logo: '💚' },
    { id: 'ovo', name: 'OVO', type: 'ewallet', logo: '💜' },
];

export default function CheckoutPage() {
    const { items, getTotal, clearCart } = useCartStore();
    const { isAuthenticated, user } = useUserStore();
    const [step, setStep] = useState(1); // 1: address, 2: shipping, 3: payment, 4: confirm
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [address, setAddress] = useState({
        recipientName: '',
        email: '',
        phone: '',
        fullAddress: '',
        city: '',
        postalCode: '',
    });

    // Fix hydration mismatch: Set user data only on client side
    useEffect(() => {
        if (user) {
            setAddress(prev => ({
                ...prev,
                recipientName: user.name || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    const subtotal = getTotal();
    const shippingCost = selectedShipping?.price || 0;
    const tax = Math.round(subtotal * 0.11); // PPN 11%
    const total = subtotal + shippingCost + tax;

    const canProceed = {
        1: address.recipientName && address.email && address.phone && address.fullAddress && address.city && address.postalCode,
        2: selectedShipping,
        3: selectedPayment,
    };

    const handlePlaceOrder = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            // Step 1: Create order
            // Prepare order data for guest or authenticated user
            const orderData = {
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    priceAtPurchase: item.salePrice || item.basePrice,
                })),
                shippingMethod: selectedShipping.id,
                shippingCost,
                paymentMethod: selectedPayment.id,
                subtotal,
                tax,
                total,
            };

            // For guest checkout, send guest data
            if (!isAuthenticated) {
                orderData.guestEmail = address.email;
                orderData.guestPhone = address.phone;
                orderData.guestName = address.recipientName;
                orderData.guestAddress = {
                    recipientName: address.recipientName,
                    phone: address.phone,
                    address: address.fullAddress,
                    city: address.city,
                    postalCode: address.postalCode,
                    country: 'Indonesia',
                };
            } else {
                // For authenticated users, send shipping address fields
                // Note: We're using manual address entry instead of saved addresses for simplicity
                orderData.shippingAddress = {
                    recipientName: address.recipientName,
                    phone: address.phone,
                    address: address.fullAddress,
                    city: address.city,
                    postalCode: address.postalCode,
                    province: address.province || '',
                };
            }

            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const { order } = await orderResponse.json();

            // Step 2: Create payment and get Snap token
            const paymentResponse = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id }),
            });

            if (!paymentResponse.ok) {
                throw new Error('Failed to create payment');
            }

            const { token } = await paymentResponse.json();

            // Step 3: Trigger Midtrans Snap
            window.snap.pay(token, {
                onSuccess: (result) => {
                    console.log('Payment success', result);
                    clearCart();
                    window.location.href = `/orders/${order.id}/success`;
                },
                onPending: (result) => {
                    console.log('Payment pending', result);
                    clearCart();
                    window.location.href = `/orders/${order.id}/pending`;
                },
                onError: (result) => {
                    console.error('Payment error', result);
                    alert('Pembayaran gagal. Silakan coba lagi.');
                    setIsProcessing(false);
                },
                onClose: () => {
                    console.log('Payment popup closed');
                    setIsProcessing(false);
                },
            });
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Terjadi kesalahan. Silakan coba lagi.');
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <>
                <Header />
                <main className="flex-1 bg-neutral-50 flex items-center justify-center py-20">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-neutral-800 mb-4">Keranjang Kosong</h1>
                        <Link href="/products">
                            <Button>Mulai Belanja</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            {/* Midtrans Snap.js Script */}
            <Script
                src={`https://app.${process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? '' : 'sandbox.'}midtrans.com/snap/snap.js`}
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            <Header />
            <main className="flex-1 bg-neutral-50">
                {/* Page Header */}
                <div className="bg-white border-b border-neutral-100">
                    <div className="container-app py-6">
                        <Link href="/cart" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Keranjang
                        </Link>
                        <h1 className="text-2xl font-bold text-neutral-800">Checkout</h1>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white border-b border-neutral-100">
                    <div className="container-app py-4">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {[
                                { num: 1, label: 'Alamat', icon: MapPin },
                                { num: 2, label: 'Pengiriman', icon: Truck },
                                { num: 3, label: 'Pembayaran', icon: CreditCard },
                                { num: 4, label: 'Konfirmasi', icon: Check },
                            ].map((s, i) => (
                                <div key={s.num} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${step >= s.num
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-neutral-100 text-neutral-400'
                                                }`}
                                        >
                                            {step > s.num ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <s.icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <span className={`text-xs mt-1 ${step >= s.num ? 'text-primary-500 font-medium' : 'text-neutral-400'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < 3 && (
                                        <div className={`w-12 md:w-24 h-0.5 mx-2 ${step > s.num ? 'bg-primary-500' : 'bg-neutral-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container-app py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Step 1: Address */}
                            {step === 1 && (
                                <div className="bg-white rounded-xl p-6">
                                    <h2 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary-500" />
                                        Alamat Pengiriman
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="Nama Penerima"
                                            value={address.recipientName}
                                            onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                                            placeholder="Nama lengkap penerima"
                                            required
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={address.email}
                                            onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                            placeholder="email@example.com"
                                            required
                                        />
                                        <Input
                                            label="Nomor Telepon"
                                            value={address.phone}
                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                            placeholder="08xxxxxxxxxx"
                                            required
                                        />
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Alamat Lengkap"
                                                value={address.fullAddress}
                                                onChange={(e) => setAddress({ ...address, fullAddress: e.target.value })}
                                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                                            />
                                        </div>
                                        <Input
                                            label="Kota"
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            placeholder="Nama kota"
                                        />
                                        <Input
                                            label="Kode Pos"
                                            value={address.postalCode}
                                            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                            placeholder="12345"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Shipping */}
                            {step === 2 && (
                                <div className="bg-white rounded-xl p-6">
                                    <h2 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-primary-500" />
                                        Metode Pengiriman
                                    </h2>
                                    <div className="space-y-3">
                                        {shippingMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedShipping(method)}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${selectedShipping?.id === method.id
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-neutral-200 hover:border-primary-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-neutral-800">{method.name}</p>
                                                        <p className="text-sm text-neutral-500">Estimasi: {method.eta}</p>
                                                    </div>
                                                    <p className="font-bold text-primary-500">{formatRupiah(method.price)}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Payment */}
                            {step === 3 && (
                                <div className="bg-white rounded-xl p-6">
                                    <h2 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary-500" />
                                        Metode Pembayaran
                                    </h2>
                                    <div className="space-y-3">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedPayment(method)}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${selectedPayment?.id === method.id
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-neutral-200 hover:border-primary-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{method.logo}</span>
                                                    <p className="font-semibold text-neutral-800">{method.name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirmation */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    {/* Address Summary */}
                                    <div className="bg-white rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary-500" />
                                                Alamat Pengiriman
                                            </h3>
                                            <button onClick={() => setStep(1)} className="text-primary-500 text-sm hover:underline">
                                                Ubah
                                            </button>
                                        </div>
                                        <p className="font-medium">{address.recipientName}</p>
                                        <p className="text-neutral-500">{address.email}</p>
                                        <p className="text-neutral-500">{address.phone}</p>
                                        <p className="text-neutral-500">{address.fullAddress}, {address.city} {address.postalCode}</p>
                                    </div>

                                    {/* Shipping Summary */}
                                    <div className="bg-white rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-primary-500" />
                                                Pengiriman
                                            </h3>
                                            <button onClick={() => setStep(2)} className="text-primary-500 text-sm hover:underline">
                                                Ubah
                                            </button>
                                        </div>
                                        <p className="font-medium">{selectedShipping?.name}</p>
                                        <p className="text-neutral-500">Estimasi: {selectedShipping?.eta}</p>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="bg-white rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-primary-500" />
                                                Pembayaran
                                            </h3>
                                            <button onClick={() => setStep(3)} className="text-primary-500 text-sm hover:underline">
                                                Ubah
                                            </button>
                                        </div>
                                        <p className="font-medium flex items-center gap-2">
                                            <span className="text-xl">{selectedPayment?.logo}</span>
                                            {selectedPayment?.name}
                                        </p>
                                    </div>

                                    {/* Items Summary */}
                                    <div className="bg-white rounded-xl p-6">
                                        <h3 className="font-semibold text-neutral-800 mb-4">Produk Dipesan</h3>
                                        <div className="space-y-4">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-neutral-800 line-clamp-1">{item.name}</p>
                                                        <p className="text-sm text-neutral-500">{item.quantity}x {formatRupiah(item.salePrice || item.basePrice)}</p>
                                                    </div>
                                                    <p className="font-semibold text-neutral-800">
                                                        {formatRupiah((item.salePrice || item.basePrice) * item.quantity)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 mt-6">
                                {step > 1 && (
                                    <Button variant="secondary" onClick={() => setStep(step - 1)}>
                                        Kembali
                                    </Button>
                                )}
                                {step < 4 ? (
                                    <Button
                                        onClick={() => setStep(step + 1)}
                                        disabled={!canProceed[step]}
                                        className="ml-auto"
                                    >
                                        Lanjutkan
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                        className="ml-auto"
                                    >
                                        {isProcessing ? 'Memproses...' : `Bayar Sekarang - ${formatRupiah(total)}`}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-neutral-800 mb-6">Ringkasan Pesanan</h2>

                                {/* Items Preview */}
                                <div className="space-y-3 mb-6">
                                    {items.slice(0, 3).map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-800 truncate">{item.name}</p>
                                                <p className="text-xs text-neutral-500">{item.quantity}x</p>
                                            </div>
                                        </div>
                                    ))}
                                    {items.length > 3 && (
                                        <p className="text-sm text-neutral-500">+{items.length - 3} produk lainnya</p>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="space-y-3 border-t border-neutral-100 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Subtotal</span>
                                        <span>{formatRupiah(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Ongkos Kirim</span>
                                        <span>{shippingCost ? formatRupiah(shippingCost) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">PPN (11%)</span>
                                        <span>{formatRupiah(tax)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-neutral-100">
                                        <span>Total</span>
                                        <span className="text-primary-500">{formatRupiah(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

