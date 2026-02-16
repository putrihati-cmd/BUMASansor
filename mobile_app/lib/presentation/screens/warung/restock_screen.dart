import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/product_model.dart';
import '../../providers/product_provider.dart';
import '../../widgets/product_card.dart';

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

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productListProvider);
    final query = _searchController.text.trim().toLowerCase();

    return Column(
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
                  // In Restocking mode, the card should probably show 'Add to Order'
                  return ProductCard(
                    product: product,
                    onTap: () {
                      // TODO: Implement Restock Cart logic
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
    );
  }
}
