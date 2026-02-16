import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/product_provider.dart';
import '../../providers/restock_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/restock_cart_bottom_sheet.dart';
import 'restock_checkout_screen.dart';

class RestockScreen extends ConsumerStatefulWidget {
  const RestockScreen({super.key});

  @override
  ConsumerState<RestockScreen> createState() => _RestockScreenState();
}

class _RestockScreenState extends ConsumerState<RestockScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openCart() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return RestockCartBottomSheet(
          onCheckout: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const RestockCheckoutScreen()),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productListProvider);
    final cart = ref.watch(restockCartProvider);
    final totalItems = cart.fold<int>(0, (sum, item) => sum + item.quantity);
    final subtotal = ref.watch(restockCartSubtotalProvider);

    final query = _searchController.text.trim().toLowerCase();

    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Cari di Katalog BUMAS...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: productsAsync.when(
              data: (products) {
                final filtered = query.isEmpty
                    ? products
                    : products
                        .where((p) =>
                            p.name.toLowerCase().contains(query) ||
                            p.barcode.toLowerCase().contains(query))
                        .toList();

                if (filtered.isEmpty) {
                  return const Center(child: Text('Produk tidak ditemukan di katalog.'));
                }

                return GridView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.85,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final product = filtered[index];
                    return ProductCard(
                      product: product,
                      onTap: () {
                        ref.read(restockCartProvider.notifier).addItem(product);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${product.name} ditambah ke rencana kulakan')),
                        );
                      },
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Gagal muat katalog: $e')),
            ),
          ),
        ],
      ),
      floatingActionButton: cart.isEmpty
          ? null
          : FloatingActionButton.extended(
              onPressed: _openCart,
              icon: Badge(
                label: Text('$totalItems'),
                child: const Icon(Icons.shopping_cart),
              ),
              label: Text('Rp ${subtotal.toStringAsFixed(0)}'),
            ),
    );
  }
}
