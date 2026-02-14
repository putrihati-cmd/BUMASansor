import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/product_model.dart';
import '../../providers/delivery_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/warehouse_provider.dart';
import '../../providers/warung_provider.dart';

class CreateDOScreen extends ConsumerStatefulWidget {
  const CreateDOScreen({super.key});

  @override
  ConsumerState<CreateDOScreen> createState() => _CreateDOScreenState();
}

class _CreateDOScreenState extends ConsumerState<CreateDOScreen> {
  final _notesController = TextEditingController();
  final _creditDaysController = TextEditingController(text: '14');
  final _productSearchController = TextEditingController();

  String? _selectedWarungId;
  String? _selectedWarehouseId;

  final List<_DOItemDraft> _items = [];
  bool _saving = false;

  @override
  void dispose() {
    _notesController.dispose();
    _creditDaysController.dispose();
    _productSearchController.dispose();
    super.dispose();
  }

  double get _total {
    return _items.fold<double>(0, (sum, item) => sum + item.subtotal);
  }

  void _addOrEditItem(ProductModel product) async {
    final existingIndex = _items.indexWhere((it) => it.productId == product.id);
    final existing = existingIndex >= 0 ? _items[existingIndex] : null;

    final qtyController = TextEditingController(text: (existing?.quantity ?? 1).toString());
    final priceController = TextEditingController(text: (existing?.price ?? product.sellPrice).toStringAsFixed(0));

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(existing == null ? 'Tambah item' : 'Edit item'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 12),
              TextField(
                controller: qtyController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Qty'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: priceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Harga'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Simpan')),
          ],
        );
      },
    );

    final qty = int.tryParse(qtyController.text.trim()) ?? 1;
    final price = double.tryParse(priceController.text.trim()) ?? product.sellPrice;
    qtyController.dispose();
    priceController.dispose();

    if (!mounted) {
      return;
    }

    if (ok != true) {
      return;
    }

    if (qty < 1) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Qty minimal 1.')));
      return;
    }

    setState(() {
      final draft = _DOItemDraft(
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity: qty,
        price: price,
      );

      if (existingIndex >= 0) {
        _items[existingIndex] = draft;
      } else {
        _items.add(draft);
      }
    });
  }

  Future<void> _submit() async {
    if (_selectedWarungId == null || _selectedWarungId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih warung.')));
      return;
    }
    if (_selectedWarehouseId == null || _selectedWarehouseId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pilih gudang/warehouse.')));
      return;
    }
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Item DO masih kosong.')));
      return;
    }

    final creditDays = int.tryParse(_creditDaysController.text.trim());

    setState(() {
      _saving = true;
    });

    try {
      final repo = ref.read(deliveryRepositoryProvider);
      await repo.createDeliveryOrder(
        warungId: _selectedWarungId!,
        warehouseId: _selectedWarehouseId!,
        items: _items
            .map(
              (e) => {
                'productId': e.productId,
                'quantity': e.quantity,
                'price': e.price,
              },
            )
            .toList(),
        creditDays: creditDays,
        notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
      );

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Delivery order berhasil dibuat.')),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal membuat DO: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final warungsAsync = ref.watch(warungListProvider(const WarungQuery(limit: 200)));
    final warehousesAsync = ref.watch(warehouseListProvider);

    final productSearch = _productSearchController.text.trim();
    final productsAsync = ref.watch(productSearchProvider(productSearch.isEmpty ? null : productSearch));

    return Scaffold(
      appBar: AppBar(title: const Text('Buat Delivery Order')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Target Warung', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          warungsAsync.when(
            data: (items) {
              if (items.isNotEmpty && (_selectedWarungId == null || _selectedWarungId!.isEmpty)) {
                _selectedWarungId = items.first.id;
              }
              return DropdownButtonFormField<String>(
                initialValue: _selectedWarungId,
                decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Pilih warung'),
                items: items
                    .map(
                      (w) => DropdownMenuItem(
                        value: w.id,
                        child: Text('${w.name} (${w.ownerName})'),
                      ),
                    )
                    .toList(),
                onChanged: (value) => setState(() => _selectedWarungId = value),
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('Gagal load warung: $e'),
          ),
          const SizedBox(height: 16),
          const Text('Warehouse', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          warehousesAsync.when(
            data: (items) {
              if (items.isNotEmpty && (_selectedWarehouseId == null || _selectedWarehouseId!.isEmpty)) {
                _selectedWarehouseId = items.first.id;
              }
              return DropdownButtonFormField<String>(
                initialValue: _selectedWarehouseId,
                decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Pilih warehouse'),
                items: items
                    .map(
                      (w) => DropdownMenuItem(
                        value: w.id,
                        child: Text(w.name),
                      ),
                    )
                    .toList(),
                onChanged: (value) => setState(() => _selectedWarehouseId = value),
              );
            },
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('Gagal load warehouse: $e'),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _creditDaysController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Credit days (opsional)',
                    hintText: '14',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Total: Rp ${_total.toStringAsFixed(0)}',
                  textAlign: TextAlign.right,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _notesController,
            maxLines: 2,
            decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Catatan (opsional)'),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),
          const Text('Item DO', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (_items.isEmpty) const Text('Belum ada item.'),
          if (_items.isNotEmpty)
            Card(
              child: Column(
                children: _items
                    .map(
                      (e) => ListTile(
                        title: Text(e.productName),
                        subtitle: Text('${e.quantity} ${e.unit ?? ''} x Rp ${e.price.toStringAsFixed(0)}'),
                        trailing: IconButton(
                          onPressed: () => setState(() => _items.remove(e)),
                          icon: const Icon(Icons.delete),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
          const SizedBox(height: 16),
          const Text('Tambah Produk', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _productSearchController,
            decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Cari produk...'),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 12),
          productsAsync.when(
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
                      subtitle: Text('${p.barcode} | Rp ${p.sellPrice.toStringAsFixed(0)}'),
                      trailing: IconButton(
                        onPressed: () => _addOrEditItem(p),
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    );
                  },
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Gagal load produk: $e'),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: _saving ? null : _submit,
            icon: _saving
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.check_circle),
            label: Text(_saving ? 'Memproses...' : 'Buat DO'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _DOItemDraft {
  _DOItemDraft({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
    this.unit,
  });

  final String productId;
  final String productName;
  final int quantity;
  final double price;
  final String? unit;

  double get subtotal => quantity * price;
}