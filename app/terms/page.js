import Link from 'next/link';
import { FileText, ArrowLeft, Shield, Lock, Eye, Database, Mail, MessageCircle } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';

export default function TermsPage() {
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
                                <FileText className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-neutral-800">Syarat dan Ketentuan</h1>
                                <p className="text-neutral-500 mt-2">Terakhir diperbarui: 16 Desember 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-app py-12">
                    <div className="max-w-4xl mx-auto prose prose-neutral">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">1. Penerimaan Ketentuan</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Dengan mengakses dan menggunakan layanan Infiatin Store, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak boleh menggunakan layanan kami.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">2. Akun Pengguna</h2>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Anda harus berusia minimal 17 tahun untuk membuat akun</li>
                                <li>Informasi yang Anda berikan harus akurat dan terkini</li>
                                <li>Anda bertanggung jawab menjaga keamanan password akun Anda</li>
                                <li>Satu orang hanya boleh memiliki satu akun aktif</li>
                                <li>Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">3. Pemesanan dan Pembayaran</h2>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Semua harga sudah termasuk PPN 11%</li>
                                <li>Pembayaran harus dilakukan dalam waktu 24 jam setelah pemesanan</li>
                                <li>Pesanan yang tidak dibayar akan otomatis dibatalkan</li>
                                <li>Kami menerima pembayaran melalui transfer bank, e-wallet, dan kartu kredit</li>
                                <li>Konfirmasi pembayaran akan diproses maksimal 2x24 jam (hari kerja)</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">4. Pengiriman</h2>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Pesanan akan diproses 1x24 jam setelah pembayaran dikonfirmasi</li>
                                <li>Estimasi waktu pengiriman tergantung lokasi dan kurir yang dipilih</li>
                                <li>Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh kurir</li>
                                <li>Pastikan alamat pengiriman yang Anda berikan lengkap dan benar</li>
                                <li>Risiko kerusakan atau kehilangan selama pengiriman menjadi tanggung jawab kurir</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">5. Refund dan Pengembalian</h2>
                            <p className="text-neutral-600 leading-relaxed mb-3">
                                Anda dapat mengajukan refund dalam kondisi berikut:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Produk yang diterima rusak atau cacat</li>
                                <li>Produk yang diterima tidak sesuai dengan pesanan</li>
                                <li>Produk tidak sampai dalam waktu yang ditentukan</li>
                                <li>Pengajuan refund maksimal 7 hari setelah barang diterima</li>
                                <li>Bukti berupa foto/video harus dilampirkan</li>
                            </ul>
                            <p className="text-neutral-600 leading-relaxed mt-3">
                                Lihat <Link href="/refund-policy" className="text-primary-500 hover:underline">Kebijakan Refund</Link> untuk detail lengkap.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">6. Hak Kekayaan Intelektual</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Semua konten di website ini, termasuk teks, gambar, logo, dan desain adalah milik Infiatin Store dan dilindungi undang-undang hak cipta. Dilarang menggunakan konten kami tanpa izin tertulis.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">7. Batasan Tanggung Jawab</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Infiatin Store tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan kami atau ketidakmampuan menggunakan layanan kami.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">8. Perubahan Ketentuan</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui website atau email. Dengan terus menggunakan layanan kami setelah perubahan, Anda dianggap menyetujui perubahan tersebut.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">9. Hukum yang Berlaku</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan melalui pengadilan yang berwenang di Jakarta.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">10. Hubungi Kami</h2>
                            <p className="text-neutral-600 leading-relaxed mb-4">
                                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami:
                            </p>
                            <div className="bg-neutral-50 rounded-xl p-6 space-y-3">
                                <p className="flex items-center gap-2 text-neutral-700">
                                    <Mail className="w-5 h-5 text-primary-500" />
                                    Email: legal@infiatin.store
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

