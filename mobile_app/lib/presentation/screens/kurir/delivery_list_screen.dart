import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/delivery_provider.dart';

class DeliveryListScreen extends ConsumerStatefulWidget {
  const DeliveryListScreen({super.key});

  @override
  ConsumerState<DeliveryListScreen> createState() => _DeliveryListScreenState();
}

class _DeliveryListScreenState extends ConsumerState<DeliveryListScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final userId = ref.watch(authProvider).user?.id;
    final deliveriesAsync =
        ref.watch(deliveryListProvider(DeliveryQuery(kurirId: userId)));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Orders'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Assigned'),
            Tab(text: 'On Delivery'),
            Tab(text: 'Completed'),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(
                deliveryListProvider(DeliveryQuery(kurirId: userId))),
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
      body: deliveriesAsync.when(
        data: (items) {
          final assigned = items.where((d) => d.status == 'ASSIGNED').toList();
          final onDelivery =
              items.where((d) => d.status == 'ON_DELIVERY').toList();
          final completed = items
              .where((d) => d.status == 'DELIVERED' || d.status == 'CONFIRMED')
              .toList();

          return TabBarView(
            controller: _tabController,
            children: [
              _DeliveryList(
                items: assigned,
                emptyText: 'Tidak ada DO assigned.',
                onTap: (id) => context.push('/kurir/deliveries/$id'),
              ),
              _DeliveryList(
                items: onDelivery,
                emptyText: 'Tidak ada DO on delivery.',
                onTap: (id) => context.push('/kurir/deliveries/$id'),
              ),
              _DeliveryList(
                items: completed,
                emptyText: 'Belum ada history.',
                onTap: (id) => context.push('/kurir/deliveries/$id'),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal load delivery: $e')),
      ),
    );
  }
}

class _DeliveryList extends StatelessWidget {
  const _DeliveryList(
      {required this.items, required this.emptyText, required this.onTap});

  final List<dynamic> items;
  final String emptyText;
  final void Function(String id) onTap;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(child: Text(emptyText));
    }

    return ListView.separated(
      padding: const EdgeInsets.only(bottom: 24),
      itemCount: items.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final d = items[index];
        return ListTile(
          onTap: () => onTap(d.id),
          title: Text(d.doNumber),
          subtitle: Text('${d.warungName} | ${d.status}'),
          trailing: Text('Rp ${d.totalAmount.toStringAsFixed(0)}'),
        );
      },
    );
  }
}
