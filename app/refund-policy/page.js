import Link from 'next/link';
import { RotateCcw, ArrowLeft, Package, Truck, Ban, CheckCircle, Mail, MessageCircle } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CartDrawer } from '@/components/cart';

export default function RefundPolicyPage() {
    return (
        <>
            <Header />
            <CartDrawer />
            <main className="flex-1 bg-neutral-50">
                < div className="bg-white border-b border-neutral-100" >
                    <div className="container-app py-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Home
                        </Link>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <RotateCcw className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-neutral-800">Kebijakan Refund & Pengembalian</h1>
                                <p className="text-neutral-500 mt-2">Terakhir diperbarui: 16 Desember 2024</p>
                            </div>
                        </div>
                    </div>
                </div >

                <div className="container-app py-12">
                    <div className="max-w-4xl mx-auto prose prose-neutral">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">1. Kondisi yang Dapat Direfund</h2>
                            <p className="text-neutral-600 leading-relaxed mb-4">
                                Kami menerima permintaan refund dalam kondisi berikut:
                            </p>

                            <div className="space-y-4">
                                <div className="bg-white rounded-xl border-2 border-primary-100 p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-800 mb-2">Produk Rusak atau Cacat</h3>
                                            <p className="text-neutral-600 text-sm">
                                                Produk yang diterima dalam kondisi rusak, pecah, atau memiliki cacat produksi.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border-2 border-primary-100 p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Ban className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-800 mb-2">Produk Tidak Sesuai Pesanan</h3>
                                            <p className="text-neutral-600 text-sm">
                                                Barang yang diterima berbeda dengan yang dipesan (warna, ukuran, varian, atau jenis produk).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border-2 border-primary-100 p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Truck className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-800 mb-2">Barang Tidak Sampai</h3>
                                            <p className="text-neutral-600 text-sm">
                                                Setelah melewati batas waktu estimasi pengiriman + 7 hari kerja, barang belum diterima.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">2. Kondisi yang TIDAK Dapat Direfund</h2>
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                                <ul className="list-disc list-inside space-y-2 text-neutral-700">
                                    <li>Berubah pikiran atau salah pilih produk</li>
                                    <li>Produk yang sudah digunakan atau kemasan rusak akibat pembeli</li>
                                    <li>Produk yang dibeli saat sale/clearance (kecuali rusak/cacat)</li>
                                    <li>Keterlambatan pengiriman akibat force majeure (bencana alam, dll)</li>
                                    <li>Alamat pengiriman salah yang disebabkan oleh pembeli</li>
                                </ul>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">3. Prosedur Pengajuan Refund</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-800 mb-1">Batas Waktu Pengajuan</h3>
                                        <p className="text-neutral-600">
                                            Maksimal <strong>7 hari</strong> setelah barang diterima (sesuai tanggal di bukti pengiriman).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-800 mb-1">Hubungi Customer Service</h3>
                                        <p className="text-neutral-600 mb-2">
                                            Ajukan permintaan refund melalui:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-neutral-600 text-sm">
                                            <li>Email: refund@infiatin.store</li>
                                            <li>WhatsApp: 0851-1945-7138</li>
                                            <li>Halaman &quot;Pesanan Saya&quot; di akun Anda</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-800 mb-1">Lampirkan Bukti</h3>
                                        <p className="text-neutral-600 mb-2">
                                            Wajib menyertakan:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-neutral-600 text-sm">
                                            <li>Foto/video produk yang rusak atau tidak sesuai (dengan kemasan)</li>
                                            <li>Foto label pengiriman (bila ada)</li>
                                            <li>Nomor pesanan</li>
                                            <li>Deskripsi masalah secara detail</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                                        4
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-800 mb-1">Tunggu Review Tim Kami</h3>
                                        <p className="text-neutral-600">
                                            Tim kami akan melakukan review dalam <strong>1-3 hari kerja</strong>. Anda akan diberitahu via email/WhatsApp mengenai hasil review.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                                        5
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-800 mb-1">Pengembalian Produk (jika diperlukan)</h3>
                                        <p className="text-neutral-600">
                                            Jika diminta mengembalikan produk, kami akan menyediakan label return atau instruksi pengiriman. <strong>Biaya return ditanggung oleh kami</strong> untuk kasus produk rusak/salah kirim.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">4. Proses Pengembalian Dana</h2>
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-neutral-800 mb-2">Setelah Refund Disetujui</h3>
                                        <p className="text-neutral-700 mb-3">
                                            Dana akan dikembalikan dalam waktu:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-neutral-700">
                                            <li><strong>Transfer Bank:</strong> 3-7 hari kerja</li>
                                            <li><strong>E-Wallet (GoPay, OVO, DANA, ShopeePay):</strong> 1-3 hari kerja</li>
                                            <li><strong>Kartu Kredit:</strong> 7-14 hari kerja (tergantung bank)</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-600 mt-4">
                                    Dana akan dikembalikan ke metode pembayaran yang sama dengan yang Anda gunakan saat checkout.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">5. Opsi Tukar Produk</h2>
                            <p className="text-neutral-600 leading-relaxed mb-3">
                                Sebagai alternatif refund, Anda dapat memilih untuk menukar produk dengan:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600">
                                <li>Produk yang sama (untuk kasus produk rusak/cacat)</li>
                                <li>Produk lain dengan nilai yang sama atau lebih tinggi</li>
                                <li>Store credit untuk pembelian berikutnya</li>
                            </ul>
                            <p className="text-neutral-600 leading-relaxed mt-3">
                                Proses tukar produk biasanya lebih cepat daripada refund (5-7 hari kerja).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">6. Catatan Penting</h2>
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                                <ul className="space-y-2 text-neutral-700">
                                    <li>• Pastikan membuka paket di depan kurir dan membuat video unboxing untuk bukti jika terjadi masalah</li>
                                    <li>• Simpan kemasan original produk untuk keperluan return</li>
                                    <li>• Keputusan akhir mengenai refund ada pada kebijakan Infiatin Store berdasarkan bukti yang dilampirkan</li>
                                    <li>• Produk yang dikembalikan harus dalam kondisi lengkap dengan kemasan dan accessories</li>
                                </ul>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-4">7. Hubungi Kami</h2>
                            <p className="text-neutral-600 leading-relaxed mb-4">
                                Jika Anda memiliki pertanyaan tentang Kebijakan Refund ini:
                            </p>
                            <div className="bg-neutral-50 rounded-xl p-6 space-y-3">
                                <p className="flex items-center gap-2 text-neutral-700">
                                    <Mail className="w-5 h-5 text-primary-500" />
                                    Email: refund@infiatin.store
                                </p>
                                <p className="flex items-center gap-2 text-neutral-700">
                                    <MessageCircle className="w-5 h-5 text-primary-500" />
                                    WhatsApp: 0851-1945-7138
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main >
            <Footer />
        </>
    );
}

