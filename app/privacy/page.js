import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Eye, Database, UserX, Cookie, Mail, MessageCircle } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-50">
                <div className="bg-white border-b border-neutral-100">
                    <div className="container-app py-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Home
                        </Link>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-neutral-800">Kebijakan Privasi</h1>
                                <p className="text-neutral-500 mt-2">Terakhir diperbarui: 16 Desember 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-app py-12">
                    <div className="max-w-4xl mx-auto prose prose-neutral">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Pendahuluan</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Di Infiatin Store, kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan layanan kami.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                <Database className="w-6 h-6 text-primary-500" />
                                1. Informasi yang Kami Kumpulkan
                            </h2>

                            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">a. Informasi yang Anda Berikan</h3>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Nama lengkap</li>
                                <li>Alamat email</li>
                                <li>Nomor telepon</li>
                                <li>Alamat pengiriman</li>
                                <li>Informasi pembayaran (disimpan dengan enkripsi)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">b. Informasi yang Dikumpulkan Otomatis</h3>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Alamat IP</li>
                                <li>Jenis browser dan perangkat</li>
                                <li>Halaman yang dikunjungi</li>
                                <li>Waktu dan durasi kunjungan</li>
                                <li>Sumber referral</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-primary-500" />
                                2. Bagaimana Kami Menggunakan Informasi
                            </h2>
                            <p className="text-neutral-600 leading-relaxed mb-3">
                                Kami menggunakan informasi Anda untuk:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Memproses pesanan dan transaksi Anda</li>
                                <li>Mengirimkan konfirmasi pesanan dan update pengiriman</li>
                                <li>Memberikan layanan pelanggan</li>
                                <li>Mengirimkan newsletter dan promosi (dengan persetujuan Anda)</li>
                                <li>Meningkatkan layanan dan pengalaman pengguna</li>
                                <li>Mencegah penipuan dan aktivitas mencurigakan</li>
                                <li>Mematuhi kewajiban hukum</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                <Lock className="w-6 h-6 text-primary-500" />
                                3. Keamanan Data
                            </h2>
                            <p className="text-neutral-600 leading-relaxed mb-3">
                                Kami mengimplementasikan langkah-langkah keamanan untuk melindungi data Anda:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Enkripsi SSL/TLS untuk transmisi data</li>
                                <li>Password di-hash menggunakan algoritma bcrypt</li>
                                <li>Akses terbatas ke data pribadi hanya untuk staff yang berwenang</li>
                                <li>Audit keamanan berkala</li>
                                <li>Backup data secara teratur</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                <UserX className="w-6 h-6 text-primary-500" />
                                4. Berbagi Informasi dengan Pihak Ketiga
                            </h2>
                            <p className="text-neutral-600 leading-relaxed mb-3">
                                Kami hanya membagikan informasi Anda kepada pihak ketiga dalam kondisi tertentu:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li><strong>Payment Gateway:</strong> Midtrans/Xendit untuk memproses pembayaran</li>
                                <li><strong>Kurir:</strong> JNE, J&T, SiCepat untuk pengiriman barang</li>
                                <li><strong>Email Service:</strong> Untuk mengirim notifikasi pesanan</li>
                                <li><strong>Analytics:</strong> Google Analytics untuk analisis traffic (data anonim)</li>
                            </ul>
                            <p className="text-neutral-600 leading-relaxed mt-3">
                                Kami <strong>tidak akan pernah menjual</strong> data pribadi Anda kepada pihak ketiga untuk tujuan marketing.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                <Cookie className="w-6 h-6 text-primary-500" />
                                5. Cookies
                            </h2>
                            <p className="text-neutral-600 leading-relaxed mb-3">
                                Kami menggunakan cookies untuk:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Menjaga sesi login Anda</li>
                                <li>Mengingat preferensi Anda</li>
                                <li>Menyimpan item di keranjang belanja</li>
                                <li>Menganalisis traffic website</li>
                            </ul>
                            <p className="text-neutral-600 leading-relaxed mt-3">
                                Anda dapat menonaktifkan cookies melalui pengaturan browser, namun beberapa fitur website mungkin tidak berfungsi optimal.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">6. Hak Anda</h2>
                            <p className="text-neutral-600 leading-relaxed mb-3">
                                Anda memiliki hak untuk:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Mengakses data pribadi yang kami simpan</li>
                                <li>Meminta koreksi data yang tidak akurat</li>
                                <li>Meminta penghapusan data Anda</li>
                                <li>Menarik persetujuan penggunaan data</li>
                                <li>Mengajukan keberatan terhadap pemrosesan data</li>
                                <li>Meminta portabilitas data</li>
                            </ul>
                            <p className="text-neutral-600 leading-relaxed mt-3">
                                Untuk menggunakan hak-hak ini, silakan hubungi kami di privacy@infiatin.store
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">7. Retensi Data</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Kami menyimpan data pribadi Anda selama akun Anda aktif atau sepanjang diperlukan untuk menyediakan layanan. Data transaksi disimpan untuk keperluan hukum dan akuntansi sesuai regulasi yang berlaku (minimal 10 tahun).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">8. Perubahan Kebijakan</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material akan diberitahukan melalui email atau notifikasi di website. Kami mendorong Anda untuk meninjau halaman ini secara berkala.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">9. Kontak</h2>
                            <p className="text-neutral-600 leading-relaxed mb-4">
                                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin menggunakan hak-hak Anda, hubungi kami:
                            </p>
                            <div className="bg-neutral-50 rounded-xl p-6 space-y-3">
                                <p className="flex items-center gap-2 text-neutral-700">
                                    <Mail className="w-5 h-5 text-primary-500" />
                                    Email: privacy@infiatin.store
                                </p>
                                <p className="flex items-center gap-2 text-neutral-700">
                                    <MessageCircle className="w-5 h-5 text-primary-500" />
                                    WhatsApp: +62 812 3456 7890
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

