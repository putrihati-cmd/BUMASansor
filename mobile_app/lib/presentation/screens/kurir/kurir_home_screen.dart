import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/delivery_provider.dart';

class KurirHomeScreen extends ConsumerStatefulWidget {
  const KurirHomeScreen({super.key});

  @override
  ConsumerState<KurirHomeScreen> createState() => _KurirHomeScreenState();
}

class _KurirHomeScreenState extends ConsumerState<KurirHomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final userId = ref.read(authProvider).user?.id;
      ref.read(deliveryProvider.notifier).loadDeliveries(kurirId: userId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final deliveryAsync = ref.watch(deliveryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kurir Delivery'),
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
        child: deliveryAsync.when(
          data: (deliveries) {
            final assigned =
                deliveries.where((d) => d.status == 'ASSIGNED').toList();
            final onDelivery =
                deliveries.where((d) => d.status == 'ON_DELIVERY').toList();
            final delivered = deliveries
                .where(
                    (d) => d.status == 'DELIVERED' || d.status == 'CONFIRMED')
                .toList();

            return ListView(
              children: [
                _Section(title: 'Assigned', items: assigned),
                const SizedBox(height: 12),
                _Section(title: 'On Delivery', items: onDelivery),
                const SizedBox(height: 12),
                _Section(title: 'Completed', items: delivered),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Text('Gagal mengambil delivery list: $error'),
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.items});

  final String title;
  final List<dynamic> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (items.isEmpty) const Text('Tidak ada data.'),
            if (items.isNotEmpty)
              ...items.map(
                (delivery) => ListTile(
                  dense: true,
                  title: Text(delivery.doNumber),
                  subtitle: Text('${delivery.warungName} - ${delivery.status}'),
                  trailing:
                      Text('Rp ${delivery.totalAmount.toStringAsFixed(0)}'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
