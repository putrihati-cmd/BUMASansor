import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/product_model.dart';
import '../../providers/category_provider.dart';
import '../../providers/product_provider.dart';

class ProductFormScreen extends ConsumerStatefulWidget {
  const ProductFormScreen({super.key, this.productId});

  final String? productId;

  @override
  ConsumerState<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends ConsumerState<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _barcodeController = TextEditingController();
  final _buyPriceController = TextEditingController(text: '0');
  final _sellPriceController = TextEditingController(text: '0');
  final _unitController = TextEditingController(text: 'pcs');
  final _descriptionController = TextEditingController();

  String? _categoryId;
  bool _isActive = true;

  bool _prefilled = false;
  bool _saving = false;

  bool get _isEdit => widget.productId != null && widget.productId!.isNotEmpty;

  @override
  void dispose() {
    _nameController.dispose();
    _barcodeController.dispose();
    _buyPriceController.dispose();
    _sellPriceController.dispose();
    _unitController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _prefillFromProduct(ProductModel p) {
    if (_prefilled) {
      return;
    }
    _prefilled = true;

    _nameController.text = p.name;
    _barcodeController.text = p.barcode;
    _buyPriceController.text = p.buyPrice.toStringAsFixed(0);
    _sellPriceController.text = p.sellPrice.toStringAsFixed(0);
    _unitController.text = p.unit;
    _descriptionController.text = p.description ?? '';
    _categoryId = p.categoryId;
    _isActive = p.isActive;
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    final categoryId = _categoryId;
    if (categoryId == null || categoryId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kategori wajib dipilih.')),
      );
      return;
    }

    setState(() {
      _saving = true;
    });

    try {
      final repo = ref.read(productRepositoryProvider);

      final buyPrice = double.tryParse(_buyPriceController.text.trim()) ?? 0;
      final sellPrice = double.tryParse(_sellPriceController.text.trim()) ?? 0;

      if (_isEdit) {
        await repo.updateProduct(
          id: widget.productId!,
          name: _nameController.text.trim(),
          barcode: _barcodeController.text.trim(),
          categoryId: categoryId,
          buyPrice: buyPrice,
          sellPrice: sellPrice,
          unit: _unitController.text.trim(),
          description: _descriptionController.text.trim().isEmpty
              ? null
              : _descriptionController.text.trim(),
          isActive: _isActive,
        );
      } else {
        await repo.createProduct(
          name: _nameController.text.trim(),
          barcode: _barcodeController.text.trim().isEmpty
              ? null
              : _barcodeController.text.trim(),
          categoryId: categoryId,
          buyPrice: buyPrice,
          sellPrice: sellPrice,
          unit: _unitController.text.trim(),
          description: _descriptionController.text.trim().isEmpty
              ? null
              : _descriptionController.text.trim(),
          isActive: _isActive,
        );
      }

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(_isEdit ? 'Produk tersimpan.' : 'Produk dibuat.')),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal menyimpan: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  Future<void> _delete() async {
    if (!_isEdit) {
      return;
    }

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Hapus produk'),
          content: const Text('Yakin ingin menghapus produk ini?'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Batal')),
            FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Hapus')),
          ],
        );
      },
    );

    if (ok != true) {
      return;
    }

    try {
      final repo = ref.read(productRepositoryProvider);
      await repo.deleteProduct(widget.productId!);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Produk dihapus (soft delete).')),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal hapus: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = _isEdit ? 'Edit Produk' : 'Tambah Produk';

    final categoriesAsync = ref.watch(categoryListProvider);

    if (_isEdit) {
      final productAsync = ref.watch(productDetailProvider(widget.productId!));
      return productAsync.when(
        data: (product) {
          _prefillFromProduct(product);
          return _buildScaffold(title, categoriesAsync);
        },
        loading: () => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: const Center(child: CircularProgressIndicator()),
        ),
        error: (e, _) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: Center(child: Text('Gagal load produk: $e')),
        ),
      );
    }

    return _buildScaffold(title, categoriesAsync);
  }

  Scaffold _buildScaffold(
      String title, AsyncValue<List<CategoryModel>> categoriesAsync) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          if (_isEdit)
            IconButton(
              tooltip: 'Hapus',
              onPressed: _saving ? null : _delete,
              icon: const Icon(Icons.delete),
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), labelText: 'Nama produk'),
                validator: (v) {
                  if (v == null || v.trim().length < 2) {
                    return 'Nama minimal 2 karakter';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _barcodeController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Barcode (opsional)'),
              ),
              const SizedBox(height: 12),
              categoriesAsync.when(
                data: (items) {
                  if (items.isNotEmpty &&
                      (_categoryId == null || _categoryId!.isEmpty)) {
                    _categoryId = items.first.id;
                  }

                  return DropdownButtonFormField<String>(
                    initialValue: _categoryId,
                    decoration: const InputDecoration(
                        border: OutlineInputBorder(), labelText: 'Kategori'),
                    items: items
                        .map(
                          (c) => DropdownMenuItem(
                            value: c.id,
                            child: Text(c.name),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _categoryId = value;
                      });
                    },
                  );
                },
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('Gagal load kategori: $e'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _buyPriceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Harga beli'),
                      validator: (v) {
                        final value = double.tryParse(v?.trim() ?? '');
                        if (value == null || value < 0) {
                          return 'Angka >= 0';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _sellPriceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Harga jual'),
                      validator: (v) {
                        final value = double.tryParse(v?.trim() ?? '');
                        if (value == null || value < 0) {
                          return 'Angka >= 0';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _unitController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), labelText: 'Unit'),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Unit wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Deskripsi (opsional)'),
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                value: _isActive,
                onChanged: (v) => setState(() => _isActive = v),
                title: const Text('Active'),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: _saving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.save),
                label: Text(_saving ? 'Menyimpan...' : 'Simpan'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
