import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/delivery_provider.dart';

class KurirHomeScreen extends ConsumerWidget {
  const KurirHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveryAsync = ref.watch(deliveryOrdersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kurir Delivery'),
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
        child: deliveryAsync.when(
          data: (deliveries) {
            if (deliveries.isEmpty) {
              return const Text('Belum ada delivery order.');
            }

            return ListView.separated(
              itemCount: deliveries.length,
              separatorBuilder: (context, index) => const Divider(),
              itemBuilder: (context, index) {
                final delivery = deliveries[index];
                return ListTile(
                  title: Text(delivery.doNumber),
                  subtitle: Text('${delivery.warungName} - ${delivery.status}'),
                  trailing: Text('Rp ${delivery.totalAmount.toStringAsFixed(0)}'),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stackTrace) => Text('Gagal mengambil delivery list: $error'),
        ),
      ),
    );
  }
}
