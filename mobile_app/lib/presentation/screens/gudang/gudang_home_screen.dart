import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/delivery_provider.dart';

class GudangHomeScreen extends ConsumerStatefulWidget {
  const GudangHomeScreen({super.key});

  @override
  ConsumerState<GudangHomeScreen> createState() => _GudangHomeScreenState();
}

class _GudangHomeScreenState extends ConsumerState<GudangHomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(deliveryProvider.notifier).loadDeliveries();
    });
  }

  @override
  Widget build(BuildContext context) {
    final deliveryAsync = ref.watch(deliveryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gudang Stock'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.read(deliveryProvider.notifier).refresh(),
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            tooltip: 'Logout',
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
            const Text('Delivery order aktif untuk disiapkan:'),
            const SizedBox(height: 8),
            Expanded(
              child: deliveryAsync.when(
                data: (deliveries) {
                  final active = deliveries.where((d) => d.status == 'PENDING' || d.status == 'ASSIGNED').toList();
                  if (active.isEmpty) {
                    return const Text('Belum ada delivery order.');
                  }

                  return ListView.separated(
                    itemCount: active.length,
                    separatorBuilder: (context, index) => const Divider(),
                    itemBuilder: (context, index) {
                      final delivery = active[index];
                      return ListTile(
                        title: Text(delivery.doNumber),
                        subtitle: Text('${delivery.warungName} - ${delivery.status}'),
                        trailing: Text('Rp ${delivery.totalAmount.toStringAsFixed(0)}'),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Text('Gagal mengambil delivery list: $error'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
