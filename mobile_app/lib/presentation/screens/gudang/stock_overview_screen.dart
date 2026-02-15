import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../data/models/stock_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/stock_provider.dart';
import '../../providers/warehouse_provider.dart';

class StockOverviewScreen extends ConsumerStatefulWidget {
  const StockOverviewScreen({super.key});

  @override
  ConsumerState<StockOverviewScreen> createState() =>
      _StockOverviewScreenState();
}

class _StockOverviewScreenState extends ConsumerState<StockOverviewScreen> {
  final _searchController = TextEditingController();
  bool _lowStockOnly = false;
  String? _warehouseId;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  StockQuery get _query {
    return StockQuery(
      warehouseId: _warehouseId,
      lowStock: _lowStockOnly ? true : null,
    );
  }

  String _money(double value) => 'Rp ${value.toStringAsFixed(0)}';

  void _openStockDetail(StockModel stock) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.75,
          builder: (context, scrollController) {
            final historyAsync = ref.watch(
              stockMovementHistoryProvider(
                StockHistoryQuery(
                    warehouseId: stock.warehouseId, productId: stock.productId),
              ),
            );

            return ListView(
              controller: scrollController,
              padding: const EdgeInsets.all(16),
              children: [
                Text(stock.product.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text('Barcode: ${stock.product.barcode}'),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Qty: ${stock.quantity} ${stock.product.unit}'),
                    Text('Min: ${stock.minStock}'),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Buy: ${_money(stock.product.buyPrice)}'),
                    Text('Sell: ${_money(stock.product.sellPrice)}'),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 8),
                const Text('Movement History',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                historyAsync.when(
                  data: (items) {
                    if (items.isEmpty) {
                      return const Text('Belum ada movement.');
                    }
                    return Card(
                      child: Column(
                        children: items
                            .take(30)
                            .map(
                              (m) => ListTile(
                                dense: true,
                                title:
                                    Text('${m.movementType} - ${m.quantity}'),
                                subtitle: Text(
                                  [
                                    if (m.fromWarehouseName != null)
                                      'From: ${m.fromWarehouseName}',
                                    if (m.toWarehouseName != null)
                                      'To: ${m.toWarehouseName}',
                                    if (m.referenceType != null)
                                      'Ref: ${m.referenceType}',
                                  ].join(' | '),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    );
                  },
                  loading: () => const Center(
                      child: Padding(
                          padding: EdgeInsets.all(24),
                          child: CircularProgressIndicator())),
                  error: (e, _) => Text('Gagal load history: $e'),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    context.push(
                        '/gudang/opname?warehouseId=${stock.warehouseId}&productId=${stock.productId}');
                  },
                  icon: const Icon(Icons.fact_check),
                  label: const Text('Stock Opname'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final warehousesAsync = ref.watch(warehouseListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Stock Overview'),
        actions: [
          IconButton(
            tooltip: 'Receive Goods',
            onPressed: () => context.push('/gudang/receive-goods'),
            icon: const Icon(Icons.add_business),
          ),
          IconButton(
            tooltip: 'Prepare Delivery',
            onPressed: () => context.push('/gudang/prepare-delivery'),
            icon: const Icon(Icons.local_shipping),
          ),
          IconButton(
            tooltip: 'Stock Opname',
            onPressed: () => context.push('/gudang/opname'),
            icon: const Icon(Icons.fact_check),
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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: warehousesAsync.when(
              data: (warehouses) {
                if (warehouses.isNotEmpty &&
                    (_warehouseId == null || _warehouseId!.isEmpty)) {
                  _warehouseId = warehouses.first.id;
                }

                return Column(
                  children: [
                    InputDecorator(
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(), labelText: 'Warehouse'),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: _warehouseId,
                          items: warehouses
                              .map(
                                (w) => DropdownMenuItem(
                                    value: w.id, child: Text(w.name)),
                              )
                              .toList(),
                          onChanged: (value) =>
                              setState(() => _warehouseId = value),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Cari nama / barcode...',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: _searchController.text.isEmpty
                            ? null
                            : IconButton(
                                onPressed: () =>
                                    setState(() => _searchController.clear()),
                                icon: const Icon(Icons.clear),
                              ),
                        border: const OutlineInputBorder(),
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 12),
                    SwitchListTile(
                      value: _lowStockOnly,
                      onChanged: (v) => setState(() => _lowStockOnly = v),
                      title: const Text('Low stock only'),
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ],
                );
              },
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => Padding(
                padding: const EdgeInsets.all(16),
                child: Text('Gagal load warehouses: $e'),
              ),
            ),
          ),
          Expanded(
            child: _warehouseId == null
                ? const Center(child: Text('Warehouse belum tersedia.'))
                : Consumer(
                    builder: (context, ref, _) {
                      final stockAsync = ref.watch(stockListProvider(_query));
                      final search =
                          _searchController.text.trim().toLowerCase();

                      return stockAsync.when(
                        data: (items) {
                          final filtered = search.isEmpty
                              ? items
                              : items
                                  .where(
                                    (s) =>
                                        s.product.name
                                            .toLowerCase()
                                            .contains(search) ||
                                        s.product.barcode
                                            .toLowerCase()
                                            .contains(search),
                                  )
                                  .toList();

                          if (filtered.isEmpty) {
                            return const Center(
                                child: Text('Tidak ada stock.'));
                          }

                          return RefreshIndicator(
                            onRefresh: () async {
                              ref.invalidate(stockListProvider(_query));
                              await Future<void>.delayed(
                                  const Duration(milliseconds: 200));
                            },
                            child: ListView.separated(
                              padding: const EdgeInsets.only(bottom: 24),
                              itemCount: filtered.length,
                              separatorBuilder: (_, __) =>
                                  const Divider(height: 1),
                              itemBuilder: (context, index) {
                                final s = filtered[index];
                                final subtitle =
                                    '${s.product.barcode} | ${s.quantity} ${s.product.unit} | Min ${s.minStock}';
                                return ListTile(
                                  onTap: () => _openStockDetail(s),
                                  title: Text(s.product.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                  subtitle: Text(subtitle,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                  trailing: s.isLowStock
                                      ? const Icon(Icons.warning_amber,
                                          color: Colors.orange)
                                      : const Icon(Icons.check_circle,
                                          color: Colors.green),
                                );
                              },
                            ),
                          );
                        },
                        loading: () =>
                            const Center(child: CircularProgressIndicator()),
                        error: (e, _) =>
                            Center(child: Text('Gagal load stock: $e')),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
