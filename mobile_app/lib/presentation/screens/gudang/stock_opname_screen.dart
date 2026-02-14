import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/product_model.dart';
import '../../providers/product_provider.dart';
import '../../providers/stock_provider.dart';
import '../../providers/warehouse_provider.dart';

class StockOpnameScreen extends ConsumerStatefulWidget {
  const StockOpnameScreen({super.key, this.initialWarehouseId, this.initialProductId});

  final String? initialWarehouseId;
  final String? initialProductId;

  @override
  ConsumerState<StockOpnameScreen> createState() => _StockOpnameScreenState();
}

class _StockOpnameScreenState extends ConsumerState<StockOpnameScreen> {
  final _actualQtyController = TextEditingController();
  final _reasonController = TextEditingController(text: 'Stock opname');
  final _productSearchController = TextEditingController();

  String? _warehouseId;
  String? _productId;

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _warehouseId = widget.initialWarehouseId;
    _productId = widget.initialProductId;
  }

  @override
  void dispose() {
    _actualQtyController.dispose();
    _reasonController.dispose();
    _productSearchController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final warehouseId = _warehouseId;
    final productId = _productId;

    if (warehouseId == null || warehouseId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih warehouse.')));
      return;
    }
    if (productId == null || productId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih produk.')));
      return;
    }

    final actualQty = int.tryParse(_actualQtyController.text.trim());
    if (actualQty == null || actualQty < 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Actual qty harus angka >= 0.')));
      return;
    }

    final reason = _reasonController.text.trim();
    if (reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reason wajib diisi.')));
      return;
    }

    setState(() => _saving = true);

    try {
      final repo = ref.read(stockRepositoryProvider);
      await repo.performOpname(
        warehouseId: warehouseId,
        productId: productId,
        actualQty: actualQty,
        reason: reason,
      );

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opname tersimpan.')));
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal opname: $e')));
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Widget _buildSelectedProductTile(ProductModel p) {
    return ListTile(
      title: Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis),
      subtitle: Text('${p.barcode} | ${p.unit}'),
      trailing: TextButton(
        onPressed: _saving
            ? null
            : () {
                setState(() {
                  _productId = null;
                  _productSearchController.clear();
                });
              },
        child: const Text('Ganti'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final warehousesAsync = ref.watch(warehouseListProvider);

    final warehouseId = _warehouseId;
    final productId = _productId;

    final stockAsync = (warehouseId != null && productId != null)
        ? ref.watch(stockListProvider(StockQuery(warehouseId: warehouseId, productId: productId)))
        : const AsyncValue<List<dynamic>>.data([]);

    return Scaffold(
      appBar: AppBar(title: const Text('Stock Opname')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          warehousesAsync.when(
            data: (warehouses) {
              if (warehouses.isNotEmpty && (_warehouseId == null || _warehouseId!.isEmpty)) {
                _warehouseId = warehouses.first.id;
              }

              return InputDecorator(
                decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Warehouse'),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _warehouseId,
                    items: warehouses
                        .map(
                          (w) => DropdownMenuItem(value: w.id, child: Text(w.name)),
                        )
                        .toList(),
                    onChanged: _saving ? null : (value) => setState(() => _warehouseId = value),
                  ),
                ),
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('Gagal load warehouses: $e'),
          ),
          const SizedBox(height: 16),
          const Text('Produk', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (_productId == null) ...[
            TextField(
              controller: _productSearchController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Cari produk...',
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),
            Builder(
              builder: (context) {
                final q = _productSearchController.text.trim();
                final productsAsync = ref.watch(productSearchProvider(q.isEmpty ? null : q));

                return productsAsync.when(
                  data: (items) {
                    if (items.isEmpty) {
                      return const Text('Tidak ada produk.');
                    }

                    return Card(
                      child: ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: items.length > 10 ? 10 : items.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final p = items[index];
                          return ListTile(
                            title: Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                            subtitle: Text('${p.barcode} | ${p.unit}'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: _saving
                                ? null
                                : () {
                                    setState(() {
                                      _productId = p.id;
                                    });
                                  },
                          );
                        },
                      ),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Text('Gagal load produk: $e'),
                );
              },
            ),
          ] else ...[
            Consumer(
              builder: (context, ref, _) {
                final productAsync = ref.watch(productDetailProvider(_productId!));
                return productAsync.when(
                  data: (p) => Card(child: _buildSelectedProductTile(p)),
                  loading: () => const LinearProgressIndicator(),
                  error: (e, _) => Text('Gagal load produk: $e'),
                );
              },
            ),
          ],
          const SizedBox(height: 16),
          stockAsync.when(
            data: (items) {
              final stock = items.isNotEmpty ? items.first : null;
              final systemQty = stock == null ? 0 : stock.quantity;
              final minStock = stock == null ? 0 : stock.minStock;
              return Card(
                child: ListTile(
                  title: const Text('System Qty'),
                  subtitle: Text('Min stock: $minStock'),
                  trailing: Text(systemQty.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('Gagal load stock: $e'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _actualQtyController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Actual Qty',
              hintText: '0',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _reasonController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Reason',
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: _saving ? null : _submit,
            icon: _saving
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.save),
            label: Text(_saving ? 'Menyimpan...' : 'Simpan'),
          ),
        ],
      ),
    );
  }
}
