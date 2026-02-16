import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/auth_provider.dart';
import '../../providers/restock_provider.dart';

class RestockCheckoutScreen extends ConsumerStatefulWidget {
  const RestockCheckoutScreen({super.key});

  @override
  ConsumerState<RestockCheckoutScreen> createState() => _RestockCheckoutScreenState();
}

class _RestockCheckoutScreenState extends ConsumerState<RestockCheckoutScreen> {
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitOrder() async {
    final cart = ref.read(restockCartProvider);
    if (cart.isEmpty) return;

    final user = ref.read(currentUserProvider);
    final warungId = user?.warungId;

    if (warungId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Warung ID tidak ditemukan')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final items = cart.map((item) => {
        'productId': item.product.id,
        'quantity': item.quantity,
        'price': item.product.basePrice,
      }).toList();

      await ref.read(restockRepositoryProvider).createOrder(
        warungId: warungId,
        items: items,
        notes: _notesController.text.trim(),
      );

      ref.read(restockCartProvider.notifier).clear();
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pesanan restock berhasil dibuat! Menunggu persetujuan BUMAS.')),
      );
      
      Navigator.of(context).pop(); // Back to Restock Screen
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal membuat pesanan: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(restockCartProvider);
    final subtotal = ref.watch(restockCartSubtotalProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Konfirmasi Kulakan')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Expanded(
              child: ListView(
                children: [
                  const Text('Daftar Belanja BUMAS',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Card(
                    child: Column(
                      children: cart
                          .map(
                            (item) => ListTile(
                              title: Text(item.product.name,
                                  maxLines: 1, overflow: TextOverflow.ellipsis),
                              subtitle: Text(
                                  '${item.quantity}x @ Rp ${item.product.basePrice.toStringAsFixed(0)}'),
                              trailing:
                                  Text('Rp ${item.subtotal.toStringAsFixed(0)}'),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Catatan Tambahan',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _notesController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Misal: Titip barang X, atau request jam pengiriman',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Card(
                    color: Colors.blue.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Estimasi Tagihan',
                                  style: TextStyle(fontWeight: FontWeight.bold)),
                              Text('Rp ${subtotal.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold, fontSize: 18)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            '* Harga dapat berubah sewaktu-waktu. Tagihan final akan dikonfirmasi saat barang siap dikirim.',
                            style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _isSubmitting ? null : _submitOrder,
                icon: _isSubmitting 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.send),
                label: Text(_isSubmitting ? 'Memproses...' : 'Kirim Pesanan Kulakan'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
