import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/delivery_order_model.dart';
import '../../providers/delivery_provider.dart';
import '../../providers/user_provider.dart';

class PrepareDeliveryScreen extends ConsumerWidget {
  const PrepareDeliveryScreen({super.key});

  String _money(double value) => 'Rp ${value.toStringAsFixed(0)}';

  Future<void> _assignKurir(
      BuildContext context, WidgetRef ref, DeliveryOrderModel delivery) async {
    final kurirsAsync = await ref.read(kurirListProvider.future);
    if (!context.mounted) {
      return;
    }

    if (kurirsAsync.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Tidak ada user role KURIR.')));
      }
      return;
    }

    String? selectedKurirId = kurirsAsync.first.id;

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Assign Kurir'),
              content: InputDecorator(
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), labelText: 'Kurir'),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: selectedKurirId,
                    items: kurirsAsync
                        .map(
                          (k) => DropdownMenuItem(
                              value: k.id,
                              child: Text('${k.name} (${k.email})')),
                        )
                        .toList(),
                    onChanged: (value) =>
                        setState(() => selectedKurirId = value),
                  ),
                ),
              ),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Batal')),
                FilledButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: const Text('Assign')),
              ],
            );
          },
        );
      },
    );

    if (ok != true) {
      return;
    }

    final kurirId = selectedKurirId;
    if (kurirId == null || kurirId.isEmpty) {
      return;
    }

    try {
      final repo = ref.read(deliveryRepositoryProvider);
      await repo.assignKurir(delivery.id, kurirId);

      if (!context.mounted) {
        return;
      }

      ref.invalidate(deliveryListProvider(const DeliveryQuery()));
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Kurir berhasil di-assign.')));
    } catch (e) {
      if (!context.mounted) {
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Gagal assign: $e')));
    }
  }

  Future<void> _startDelivery(
      BuildContext context, WidgetRef ref, DeliveryOrderModel delivery) async {
    try {
      final repo = ref.read(deliveryRepositoryProvider);
      await repo.startDelivery(delivery.id);

      if (!context.mounted) {
        return;
      }

      ref.invalidate(deliveryListProvider(const DeliveryQuery()));
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Delivery dimulai.')));
    } catch (e) {
      if (!context.mounted) {
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Gagal start: $e')));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveriesAsync =
        ref.watch(deliveryListProvider(const DeliveryQuery()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Prepare Delivery (Packing)'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () =>
                ref.invalidate(deliveryListProvider(const DeliveryQuery())),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: deliveriesAsync.when(
        data: (items) {
          final active = items
              .where((d) => d.status == 'PENDING' || d.status == 'ASSIGNED')
              .toList();
          if (active.isEmpty) {
            return const Center(child: Text('Tidak ada DO untuk disiapkan.'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(deliveryListProvider(const DeliveryQuery()));
              await Future<void>.delayed(const Duration(milliseconds: 200));
            },
            child: ListView.separated(
              padding: const EdgeInsets.only(bottom: 24),
              itemCount: active.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final d = active[index];
                return ListTile(
                  title: Text(d.doNumber),
                  subtitle: Text('${d.warungName} | ${d.status}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_money(d.totalAmount)),
                      const SizedBox(width: 8),
                      if (d.status == 'PENDING')
                        OutlinedButton(
                          onPressed: () => _assignKurir(context, ref, d),
                          child: const Text('Assign'),
                        ),
                      if (d.status == 'ASSIGNED')
                        OutlinedButton(
                          onPressed: () => _startDelivery(context, ref, d),
                          child: const Text('Start'),
                        ),
                    ],
                  ),
                  onTap: () {
                    _showDetail(context, d);
                  },
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal load delivery: $e')),
      ),
    );
  }

  void _showDetail(BuildContext context, DeliveryOrderModel d) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.8,
          builder: (context, controller) {
            return ListView(
              controller: controller,
              padding: const EdgeInsets.all(16),
              children: [
                Text(d.doNumber,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text('Warung: ${d.warung.name}'),
                if (d.warung.address != null)
                  Text('Alamat: ${d.warung.address}'),
                const SizedBox(height: 12),
                const Text('Items',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Card(
                  child: Column(
                    children: d.items
                        .map(
                          (i) => ListTile(
                            dense: true,
                            title: Text(i.productName),
                            subtitle: Text(
                                '${i.quantity} ${i.unit ?? ''} x Rp ${i.price.toStringAsFixed(0)}'),
                            trailing:
                                Text('Rp ${i.subtotal.toStringAsFixed(0)}'),
                          ),
                        )
                        .toList(),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
