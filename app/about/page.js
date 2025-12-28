'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Shield, Truck, Award, Users, Target, Heart, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';
import { Button } from '@/components/ui';

const values = [
    { icon: Shield, title: 'Kualitas Terjamin', desc: '100% produk original dengan garansi resmi' },
    { icon: Truck, title: 'Pengiriman Cepat', desc: 'Pesanan diproses dalam 24 jam dan dikirim ke seluruh Indonesia' },
    { icon: Award, title: 'Kepercayaan Pelanggan', desc: 'Dipercaya oleh lebih dari 10.000+ pelanggan' },
    { icon: Heart, title: 'Layanan Prima', desc: 'Customer service yang ramah dan responsif' },
];

const stats = [
    { value: '10K+', label: 'Pelanggan Puas' },
    { value: '500+', label: 'Produk' },
    { value: '50+', label: 'Brand Partner' },
    { value: '99%', label: 'Rating Positif' },
];

const team = [
    { name: 'Sarah Wijaya', role: 'Founder & CEO', image: 'https://picsum.photos/seed/team1/300/300' },
    { name: 'Michael Santoso', role: 'Head of Operations', image: 'https://picsum.photos/seed/team2/300/300' },
    { name: 'Lisa Permata', role: 'Head of Marketing', image: 'https://picsum.photos/seed/team3/300/300' },
];

export default function AboutPage() {
    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary-600 to-primary-700 py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                    <div className="container-app relative z-10 text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Tentang Infiatin Store
                        </h1>
                        <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                            Destinasi belanja online terpercaya untuk kebutuhan kecantikan dan perawatan diri Anda
                        </p>
                    </div>
                </section>

                {/* Our Story */}
                <section className="py-16 bg-white">
                    <div className="container-app">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="text-primary-500 font-semibold">Cerita Kami</span>
                                <h2 className="text-3xl font-display font-bold text-neutral-800 mt-2 mb-6">
                                    Perjalanan Menuju Kepercayaan Pelanggan
                                </h2>
                                <div className="space-y-4 text-neutral-600">
                                    <p>
                                        <strong className="text-neutral-800">Infiatin Store</strong> didirikan pada tahun 2020
                                        dengan misi sederhana: menyediakan produk kecantikan berkualitas tinggi dengan harga
                                        terjangkau untuk semua orang.
                                    </p>
                                    <p>
                                        Kami memulai sebagai toko kecil dengan beberapa produk pilihan. Berkat kepercayaan
                                        pelanggan dan komitmen kami terhadap kualitas, kini kami telah berkembang menjadi
                                        salah satu platform e-commerce kecantikan terpercaya di Indonesia.
                                    </p>
                                    <p>
                                        Setiap produk yang kami jual telah melalui proses seleksi ketat untuk memastikan
                                        keaslian dan kualitasnya. Kami bekerja sama langsung dengan brand resmi dan
                                        distributor terpercaya.
                                    </p>
                                </div>
                            </div>
                            <div className="relative h-96 rounded-xl overflow-hidden shadow-xl">
                                <Image
                                    src="https://picsum.photos/seed/about-infiatin/800/600"
                                    alt="About Infiatin Store"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 bg-neutral-50">
                    <div className="container-app">
                        <div className="text-center mb-12">
                            <span className="text-primary-500 font-semibold">Nilai Kami</span>
                            <h2 className="text-3xl font-display font-bold text-neutral-800 mt-2">
                                Mengapa Memilih Kami?
                            </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm">
                                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="w-7 h-7 text-primary-500" />
                                    </div>
                                    <h3 className="font-semibold text-neutral-800 mb-2">{value.title}</h3>
                                    <p className="text-sm text-neutral-500">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-16 bg-primary-500">
                    <div className="container-app">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center text-white">
                                    <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                                    <p className="text-primary-100">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="py-16 bg-white">
                    <div className="container-app">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8">
                                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-800 mb-3">Visi</h3>
                                <p className="text-neutral-600">
                                    Menjadi platform e-commerce kecantikan terdepan di Indonesia yang dipercaya oleh jutaan
                                    pelanggan untuk kebutuhan perawatan diri mereka.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-8">
                                <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-800 mb-3">Misi</h3>
                                <p className="text-neutral-600">
                                    Menyediakan akses mudah ke produk kecantikan berkualitas dengan harga terjangkau,
                                    pelayanan prima, dan pengiriman cepat ke seluruh Indonesia.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Info */}
                <section className="py-16 bg-neutral-50">
                    <div className="container-app">
                        <div className="text-center mb-12">
                            <span className="text-primary-500 font-semibold">Hubungi Kami</span>
                            <h2 className="text-3xl font-display font-bold text-neutral-800 mt-2">
                                Ada Pertanyaan?
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="font-semibold text-neutral-800 mb-2">Alamat</h3>
                                <p className="text-sm text-neutral-500">Jl. Sudirman No. 123, Jakarta Pusat 10110</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="font-semibold text-neutral-800 mb-2">Telepon</h3>
                                <p className="text-sm text-neutral-500">+62 21 1234 5678</p>
                                <p className="text-sm text-neutral-500">0851-1945-7138 (WhatsApp)</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="font-semibold text-neutral-800 mb-2">Jam Operasional</h3>
                                <p className="text-sm text-neutral-500">Senin - Jumat: 09:00 - 18:00</p>
                                <p className="text-sm text-neutral-500">Sabtu: 09:00 - 15:00</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

