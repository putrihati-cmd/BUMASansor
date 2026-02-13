import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/cart_provider.dart';

class CartBottomSheet extends ConsumerWidget {
  const CartBottomSheet({
    super.key,
    required this.onCheckout,
  });

  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final subtotal = ref.watch(cartSubtotalProvider);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Keranjang', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: cart.isEmpty ? null : () => ref.read(cartProvider.notifier).clear(),
                  child: const Text('Kosongkan'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (cart.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Text('Keranjang kosong'),
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
                      title: Text(item.product.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text('Rp ${item.product.sellPrice.toStringAsFixed(0)}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            onPressed: () => ref.read(cartProvider.notifier).updateQuantity(item.product.id, item.quantity - 1),
                            icon: const Icon(Icons.remove),
                          ),
                          Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          IconButton(
                            onPressed: () => ref.read(cartProvider.notifier).updateQuantity(item.product.id, item.quantity + 1),
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
                const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                Text('Rp ${subtotal.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
              icon: const Icon(Icons.payment),
              label: const Text('Checkout'),
            ),
          ],
        ),
      ),
    );
  }
}