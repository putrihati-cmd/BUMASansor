import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/purchase_order_model.dart';
import '../../providers/purchase_order_provider.dart';

class ReceiveGoodsScreen extends ConsumerWidget {
  const ReceiveGoodsScreen({super.key});

  String _money(double value) => 'Rp ${value.toStringAsFixed(0)}';

  Future<void> _receive(
      BuildContext context, WidgetRef ref, PurchaseOrderModel po) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Terima Barang'),
          content: Text(
              'Terima PO ${po.poNumber}? Ini akan menambah stock ke warehouse ${po.warehouse.name}.'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Batal')),
            FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Terima')),
          ],
        );
      },
    );

    if (ok != true) {
      return;
    }

    try {
      final repo = ref.read(purchaseOrderRepositoryProvider);
      await repo.receivePurchaseOrder(po.id);

      if (!context.mounted) {
        return;
      }

      ref.invalidate(approvedPurchaseOrdersProvider);
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('PO diterima.')));
    } catch (e) {
      if (!context.mounted) {
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Gagal receive: $e')));
    }
  }

  void _showDetail(BuildContext context, WidgetRef ref, PurchaseOrderModel po) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.8,
          builder: (context, scrollController) {
            return ListView(
              controller: scrollController,
              padding: const EdgeInsets.all(16),
              children: [
                Text('PO ${po.poNumber}',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text('Supplier: ${po.supplier.name}'),
                Text('Warehouse: ${po.warehouse.name}'),
                Text('Status: ${po.status}'),
                const SizedBox(height: 8),
                Text('Total: ${_money(po.totalAmount)}',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                const Divider(),
                const Text('Items',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Card(
                  child: Column(
                    children: po.items
                        .map(
                          (i) => ListTile(
                            dense: true,
                            title: Text(i.product.name,
                                maxLines: 1, overflow: TextOverflow.ellipsis),
                            subtitle: Text(
                                '${i.quantity} ${i.product.unit} x ${_money(i.price)}'),
                            trailing: Text(_money(i.subtotal)),
                          ),
                        )
                        .toList(),
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    _receive(context, ref, po);
                  },
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Terima Barang (Receive)'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final posAsync = ref.watch(approvedPurchaseOrdersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Receive Goods (PO Approved)'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(approvedPurchaseOrdersProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: posAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('Tidak ada PO approved.'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(approvedPurchaseOrdersProvider);
              await Future<void>.delayed(const Duration(milliseconds: 200));
            },
            child: ListView.separated(
              padding: const EdgeInsets.only(bottom: 24),
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final po = items[index];
                return ListTile(
                  onTap: () => _showDetail(context, ref, po),
                  title: Text('PO ${po.poNumber}'),
                  subtitle: Text(
                      '${po.supplier.name} | ${po.warehouse.name} | ${_money(po.totalAmount)}'),
                  trailing: OutlinedButton(
                    onPressed: () => _receive(context, ref, po),
                    child: const Text('Receive'),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal load PO: $e')),
      ),
    );
  }
}
