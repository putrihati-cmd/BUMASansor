import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/sync_provider.dart';

class WarungHomeScreen extends ConsumerWidget {
  const WarungHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productAsync = ref.watch(productListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Warung POS'),
        actions: [
          IconButton(
            onPressed: () async {
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FilledButton.icon(
              onPressed: () async {
                final count = await ref.read(syncServiceProvider).processQueue();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Sync berhasil: $count task')),
                  );
                }
              },
              icon: const Icon(Icons.sync),
              label: const Text('Sync Queue'),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: productAsync.when(
                data: (products) {
                  if (products.isEmpty) {
                    return const Text('Belum ada produk.');
                  }

                  return ListView.separated(
                    itemCount: products.length,
                    separatorBuilder: (context, index) => const Divider(),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      return ListTile(
                        title: Text(product.name),
                        subtitle: Text('${product.barcode} - ${product.unit}'),
                        trailing: Text('Rp ${product.sellPrice.toStringAsFixed(0)}'),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => Text('Gagal mengambil produk: $error'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
