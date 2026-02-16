import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/restock_provider.dart';

class RestockCartBottomSheet extends ConsumerWidget {
  const RestockCartBottomSheet({
    super.key,
    required this.onCheckout,
  });

  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(restockCartProvider);
    final subtotal = ref.watch(restockCartSubtotalProvider);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Rencana Kulakan',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: cart.isEmpty
                      ? null
                      : () => ref.read(restockCartProvider.notifier).clear(),
                  child: const Text('Kosongkan'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (cart.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Text('Belum ada barang di rencana kulakan', textAlign: TextAlign.center),
              )
            else
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: cart.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final item = cart[index];
                    return ListTile(
                      title: Text(item.product.name,
                          maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text(
                          'Estimasi per unit: Rp ${item.product.basePrice.toStringAsFixed(0)}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            onPressed: () => ref
                                .read(restockCartProvider.notifier)
                                .updateQuantity(
                                    item.product.id, item.quantity - 1),
                            icon: const Icon(Icons.remove),
                          ),
                          Text('${item.quantity}',
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold)),
                          IconButton(
                            onPressed: () => ref
                                .read(restockCartProvider.notifier)
                                .updateQuantity(
                                    item.product.id, item.quantity + 1),
                            icon: const Icon(Icons.add),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Estimasi Total',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                Text('Rp ${subtotal.toStringAsFixed(0)}',
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: cart.isEmpty
                  ? null
                  : () {
                      Navigator.of(context).pop();
                      onCheckout();
                    },
              icon: const Icon(Icons.shopping_cart_checkout),
              label: const Text('Buat Pesanan Restock'),
            ),
          ],
        ),
      ),
    );
  }
}
