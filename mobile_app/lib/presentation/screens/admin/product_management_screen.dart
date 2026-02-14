import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/product_provider.dart';

class ProductManagementScreen extends ConsumerStatefulWidget {
  const ProductManagementScreen({super.key});

  @override
  ConsumerState<ProductManagementScreen> createState() => _ProductManagementScreenState();
}

class _ProductManagementScreenState extends ConsumerState<ProductManagementScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String? get _search {
    final value = _searchController.text.trim();
    return value.isEmpty ? null : value;
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productSearchProvider(_search));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manajemen Produk'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(productSearchProvider(_search)),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari nama / barcode...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          setState(() {
                            _searchController.clear();
                          });
                        },
                        icon: const Icon(Icons.clear),
                      ),
                border: const OutlineInputBorder(),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: productsAsync.when(
              data: (items) {
                if (items.isEmpty) {
                  return const Center(child: Text('Tidak ada produk.'));
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(productSearchProvider(_search));
                    await Future<void>.delayed(const Duration(milliseconds: 200));
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final p = items[index];
                      final status = p.isActive ? 'ACTIVE' : 'INACTIVE';
                      return ListTile(
                        onTap: () => context.push('/admin/products/${p.id}'),
                        title: Text(p.name),
                        subtitle: Text('${p.barcode} | ${p.category?.name ?? p.categoryId} | ${p.unit}'),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Rp ${p.sellPrice.toStringAsFixed(0)}'),
                            const SizedBox(height: 2),
                            Text(
                              status,
                              style: TextStyle(
                                fontSize: 11,
                                color: p.isActive ? Colors.green : Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Gagal load produk: $error'),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: () => ref.invalidate(productSearchProvider(_search)),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/admin/products/new'),
        icon: const Icon(Icons.add),
        label: const Text('Tambah'),
      ),
    );
  }
}