'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, HelpCircle, ShoppingBag, Truck, CreditCard, RotateCcw, User, MessageCircle, Phone, Mail } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button, Input } from '@/components/ui';

const categories = [
    { id: 'order', icon: ShoppingBag, label: 'Pesanan' },
    { id: 'shipping', icon: Truck, label: 'Pengiriman' },
    { id: 'payment', icon: CreditCard, label: 'Pembayaran' },
    { id: 'refund', icon: RotateCcw, label: 'Refund' },
    { id: 'account', icon: User, label: 'Akun' },
];

const faqs = [
    {
        category: 'order',
        question: 'Bagaimana cara melakukan pemesanan?',
        answer: 'Untuk melakukan pemesanan, pilih produk yang Anda inginkan, tambahkan ke keranjang, lalu lanjutkan ke proses checkout. Isi alamat pengiriman dan pilih metode pembayaran, kemudian selesaikan pembayaran Anda.'
    },
    {
        category: 'order',
        question: 'Apakah saya bisa membatalkan pesanan?',
        answer: 'Pesanan dapat dibatalkan selama status masih "Menunggu Pembayaran". Setelah pembayaran dikonfirmasi dan pesanan diproses, pembatalan tidak dapat dilakukan. Anda dapat mengajukan refund setelah menerima barang.'
    },
    {
        category: 'order',
        question: 'Berapa lama pesanan saya diproses?',
        answer: 'Pesanan akan diproses dalam waktu 1x24 jam setelah pembayaran dikonfirmasi (hari kerja). Pesanan yang masuk setelah pukul 15:00 WIB atau di hari libur akan diproses pada hari kerja berikutnya.'
    },
    {
        category: 'shipping',
        question: 'Kurir apa saja yang tersedia?',
        answer: 'Kami bekerja sama dengan JNE, J&T Express, SiCepat, dan AnterAja untuk pengiriman ke seluruh Indonesia. Anda dapat memilih kurir sesuai preferensi saat checkout.'
    },
    {
        category: 'shipping',
        question: 'Berapa lama estimasi pengiriman?',
        answer: 'Estimasi pengiriman tergantung pada lokasi dan layanan kurir yang dipilih. Untuk wilayah Jabodetabek: 1-3 hari. Pulau Jawa lainnya: 2-4 hari. Luar Jawa: 4-7 hari.'
    },
    {
        category: 'shipping',
        question: 'Bagaimana cara melacak pesanan saya?',
        answer: 'Setelah pesanan dikirim, Anda akan menerima nomor resi melalui email dan notifikasi. Anda dapat melacak pesanan melalui halaman "Pesanan Saya" atau langsung di website kurir terkait.'
    },
    {
        category: 'payment',
        question: 'Metode pembayaran apa saja yang tersedia?',
        answer: 'Kami menerima pembayaran melalui Transfer Bank (BCA, Mandiri, BRI, BNI), Virtual Account, E-Wallet (GoPay, OVO, ShopeePay, DANA), QRIS, dan Kartu Kredit/Debit.'
    },
    {
        category: 'payment',
        question: 'Berapa lama batas waktu pembayaran?',
        answer: 'Batas waktu pembayaran adalah 24 jam setelah pesanan dibuat. Jika tidak ada pembayaran dalam waktu tersebut, pesanan akan otomatis dibatalkan.'
    },
    {
        category: 'refund',
        question: 'Bagaimana cara mengajukan refund?',
        answer: 'Refund dapat diajukan maksimal 7 hari setelah barang diterima dengan kondisi: produk rusak/cacat, tidak sesuai pesanan, atau tidak sampai. Hubungi customer service kami dengan melampirkan foto bukti.'
    },
    {
        category: 'refund',
        question: 'Berapa lama proses refund?',
        answer: 'Setelah pengajuan refund disetujui, dana akan dikembalikan dalam waktu 3-7 hari kerja ke rekening atau e-wallet yang Anda daftarkan.'
    },
    {
        category: 'account',
        question: 'Bagaimana cara mengubah password?',
        answer: 'Masuk ke akun Anda, buka menu "Keamanan", lalu pilih "Ubah Password". Masukkan password lama dan password baru Anda, kemudian simpan perubahan.'
    },
    {
        category: 'account',
        question: 'Apakah data saya aman?',
        answer: 'Ya, kami menggunakan enkripsi SSL dan sistem keamanan berlapis untuk melindungi data pribadi Anda. Kami tidak pernah membagikan data Anda kepada pihak ketiga tanpa persetujuan.'
    },
];

export default function HelpPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [openFaq, setOpenFaq] = useState(null);

    const filteredFaqs = faqs.filter((faq) => {
        const matchesCategory = !selectedCategory || faq.category === selectedCategory;
        const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) ||
            faq.answer.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-50">
                {/* Hero */}
                <section className="bg-gradient-to-br from-primary-500 to-primary-600 py-16">
                    <div className="container-app text-center">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            Pusat Bantuan
                        </h1>
                        <p className="text-primary-100 mb-8 max-w-xl mx-auto">
                            Ada pertanyaan? Temukan jawaban untuk pertanyaan yang sering diajukan di bawah ini.
                        </p>
                        <div className="max-w-lg mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari pertanyaan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>
                    </div>
                </section>

                <div className="container-app py-12">
                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-5 py-2.5 rounded-full font-medium transition-colors ${selectedCategory === ''
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                                }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${selectedCategory === cat.id
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white text-neutral-600 hover:bg-neutral-100'
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* FAQs */}
                    <div className="max-w-3xl mx-auto space-y-4">
                        {filteredFaqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full p-5 flex items-center justify-between text-left"
                                >
                                    <span className="font-semibold text-neutral-800 pr-4">{faq.question}</span>
                                    <ChevronDown className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''
                                        }`} />
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-5 pt-0">
                                        <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-12">
                                <HelpCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500">Tidak ada hasil yang ditemukan</p>
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="mt-16 bg-white rounded-xl p-8 text-center max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-neutral-800 mb-2">Masih butuh bantuan?</h2>
                        <p className="text-neutral-500 mb-6">
                            Tim customer service kami siap membantu Anda
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="https://wa.me/6281234567890" target="_blank">
                                <Button>
                                    <MessageCircle className="w-4 h-4" />
                                    Chat WhatsApp
                                </Button>
                            </Link>
                            <Link href="mailto:help@infiatin.store">
                                <Button variant="secondary">
                                    <Mail className="w-4 h-4" />
                                    Email Kami
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

