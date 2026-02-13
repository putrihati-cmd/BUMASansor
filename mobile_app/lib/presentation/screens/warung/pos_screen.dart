import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/sales_provider.dart';
import '../../providers/sync_provider.dart';
import '../../widgets/cart_bottom_sheet.dart';
import '../../widgets/product_card.dart';
import 'checkout_screen.dart';
import 'daily_summary_screen.dart';
import 'sales_history_screen.dart';

class POSScreen extends ConsumerStatefulWidget {
  const POSScreen({super.key});

  @override
  ConsumerState<POSScreen> createState() => _POSScreenState();
}

class _POSScreenState extends ConsumerState<POSScreen> {
  final _searchController = TextEditingController();
  bool _isGridView = true;
  @override
  void initState() {
    super.initState();

    // Prefetch default warehouse to enable offline queue.
    Future.microtask(() async {
      try {
        await ref.read(warehouseRepositoryProvider).getDefaultWarehouseId();
      } catch (_) {
        // Ignore; offline queue will show error if not initialized.
      }
    });
  }
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
        return CartBottomSheet(
          onCheckout: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const CheckoutScreen()),
            );
          },
        );
      },
    );
  }

  void _openScanner() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Scan Barcode', style: TextStyle(fontWeight: FontWeight.bold)),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: MobileScanner(
                  onDetect: (capture) async {
                    final barcodes = capture.barcodes;
                    if (barcodes.isEmpty) {
                      return;
                    }

                    final raw = barcodes.first.rawValue;
                    if (raw == null || raw.isEmpty) {
                      return;
                    }

                    Navigator.of(context).pop();
                    await _handleBarcode(raw);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleBarcode(String barcode) async {
    try {
      final repository = ref.read(productRepositoryProvider);
      final product = await repository.fetchByBarcode(barcode);

      ref.read(cartProvider.notifier).addProduct(product);
      await SystemSound.play(SystemSoundType.click);

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${product.name} ditambahkan ke keranjang')),
      );
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Produk tidak ditemukan: $barcode')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final productAsync = ref.watch(productListProvider);
    final cart = ref.watch(cartProvider);
    final totalItems = ref.watch(cartTotalItemsProvider);
    final subtotal = ref.watch(cartSubtotalProvider);

    final query = _searchController.text.trim().toLowerCase();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Warung POS'),
        actions: [
          IconButton(
            tooltip: 'Sync Queue',
            onPressed: () async {
              final count = await ref.read(syncServiceProvider).processQueue();
              if (!context.mounted) {
                return;
              }
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Sync berhasil: $count task')),
              );
            },
            icon: const Icon(Icons.sync),
          ),
          IconButton(
            tooltip: 'Riwayat',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SalesHistoryScreen()),
              );
            },
            icon: const Icon(Icons.history),
          ),
          IconButton(
            tooltip: 'Ringkasan Harian',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const DailySummaryScreen()),
              );
            },
            icon: const Icon(Icons.bar_chart),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: auth.loading
                ? null
                : () async {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      labelText: 'Cari produk',
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _openScanner,
                  icon: const Icon(Icons.qr_code_scanner),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () {
                    setState(() {
                      _isGridView = !_isGridView;
                    });
                  },
                  icon: Icon(_isGridView ? Icons.list : Icons.grid_view),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Expanded(
              child: productAsync.when(
                data: (products) {
                  final filtered = query.isEmpty
                      ? products
                      : products
                          .where(
                            (p) => p.name.toLowerCase().contains(query) || p.barcode.toLowerCase().contains(query),
                          )
                          .toList();

                  if (filtered.isEmpty) {
                    return const Center(child: Text('Produk tidak ditemukan.'));
                  }

                  if (_isGridView) {
                    return GridView.builder(
                      itemCount: filtered.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.9,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemBuilder: (context, index) {
                        final product = filtered[index];
                        return ProductCard(
                          product: product,
                          onTap: () => ref.read(cartProvider.notifier).addProduct(product),
                        );
                      },
                    );
                  }

                  return ListView.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final product = filtered[index];
                      return ProductCard(
                        product: product,
                        isListView: true,
                        onTap: () => ref.read(cartProvider.notifier).addProduct(product),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Center(child: Text('Gagal mengambil produk: $error')),
              ),
            ),
          ],
        ),
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