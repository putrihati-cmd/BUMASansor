import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/warung_provider.dart';

class WarungFormScreen extends ConsumerStatefulWidget {
  const WarungFormScreen({super.key, this.warungId});

  final String? warungId;

  @override
  ConsumerState<WarungFormScreen> createState() => _WarungFormScreenState();
}

class _WarungFormScreenState extends ConsumerState<WarungFormScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _ownerController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _regionController = TextEditingController();
  final _creditLimitController = TextEditingController(text: '0');
  final _creditDaysController = TextEditingController(text: '14');
  final _latController = TextEditingController();
  final _lngController = TextEditingController();

  bool _prefilled = false;
  bool _saving = false;

  bool get _isEdit => widget.warungId != null && widget.warungId!.isNotEmpty;

  @override
  void dispose() {
    _nameController.dispose();
    _ownerController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _regionController.dispose();
    _creditLimitController.dispose();
    _creditDaysController.dispose();
    _latController.dispose();
    _lngController.dispose();
    super.dispose();
  }

  void _prefillIfNeeded(Map<String, dynamic> warungJson) {
    if (_prefilled) {
      return;
    }
    _prefilled = true;

    _nameController.text = warungJson['name']?.toString() ?? '';
    _ownerController.text = warungJson['ownerName']?.toString() ?? '';
    _phoneController.text = warungJson['phone']?.toString() ?? '';
    _addressController.text = warungJson['address']?.toString() ?? '';
    _regionController.text = warungJson['region']?.toString() ?? '';
    _creditLimitController.text = warungJson['creditLimit']?.toString() ?? '0';
    _creditDaysController.text = warungJson['creditDays']?.toString() ?? '14';
    _latController.text = warungJson['latitude']?.toString() ?? '';
    _lngController.text = warungJson['longitude']?.toString() ?? '';
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() {
      _saving = true;
    });

    try {
      final repo = ref.read(warungRepositoryProvider);

      final creditLimit =
          double.tryParse(_creditLimitController.text.trim()) ?? 0;
      final creditDays = int.tryParse(_creditDaysController.text.trim()) ?? 14;
      final lat = double.tryParse(_latController.text.trim());
      final lng = double.tryParse(_lngController.text.trim());

      if (_isEdit) {
        await repo.updateWarung(
          id: widget.warungId!,
          name: _nameController.text.trim(),
          ownerName: _ownerController.text.trim(),
          phone: _phoneController.text.trim().isEmpty
              ? null
              : _phoneController.text.trim(),
          address: _addressController.text.trim().isEmpty
              ? null
              : _addressController.text.trim(),
          region: _regionController.text.trim().isEmpty
              ? null
              : _regionController.text.trim(),
          creditLimit: creditLimit,
          creditDays: creditDays,
          latitude: lat,
          longitude: lng,
        );
      } else {
        await repo.createWarung(
          name: _nameController.text.trim(),
          ownerName: _ownerController.text.trim(),
          phone: _phoneController.text.trim().isEmpty
              ? null
              : _phoneController.text.trim(),
          address: _addressController.text.trim().isEmpty
              ? null
              : _addressController.text.trim(),
          region: _regionController.text.trim().isEmpty
              ? null
              : _regionController.text.trim(),
          creditLimit: creditLimit,
          creditDays: creditDays,
          latitude: lat,
          longitude: lng,
        );
      }

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(_isEdit ? 'Warung tersimpan.' : 'Warung dibuat.')),
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
          title: const Text('Hapus warung'),
          content: const Text('Yakin ingin menghapus warung ini?'),
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
      final repo = ref.read(warungRepositoryProvider);
      await repo.deleteWarung(widget.warungId!);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Warung dihapus (soft delete).')),
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
    final title = _isEdit ? 'Edit Warung' : 'Tambah Warung';

    if (_isEdit) {
      final warungAsync = ref.watch(warungDetailProvider(widget.warungId!));
      return warungAsync.when(
        data: (warung) {
          _prefillIfNeeded({
            'name': warung.name,
            'ownerName': warung.ownerName,
            'phone': warung.phone,
            'address': warung.address,
            'region': warung.region,
            'creditLimit': warung.creditLimit,
            'creditDays': warung.creditDays,
            'latitude': warung.latitude,
            'longitude': warung.longitude,
          });
          return _buildScaffold(title);
        },
        loading: () => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: const Center(child: CircularProgressIndicator()),
        ),
        error: (e, _) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: Center(child: Text('Gagal load warung: $e')),
        ),
      );
    }

    return _buildScaffold(title);
  }

  Scaffold _buildScaffold(String title) {
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
                    border: OutlineInputBorder(), labelText: 'Nama warung'),
                validator: (v) {
                  if (v == null || v.trim().length < 2) {
                    return 'Nama minimal 2 karakter';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _ownerController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), labelText: 'Nama owner'),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Owner wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'No HP (opsional)'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressController,
                maxLines: 2,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Alamat (opsional)'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _regionController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Region (opsional)'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _creditLimitController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Credit Limit'),
                      validator: (v) {
                        final value = double.tryParse(v?.trim() ?? '');
                        if (value == null || value < 0) {
                          return 'Isi angka >= 0';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _creditDaysController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Credit Days'),
                      validator: (v) {
                        final value = int.tryParse(v?.trim() ?? '');
                        if (value == null || value < 1 || value > 30) {
                          return '1-30';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _latController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Latitude (opsional)'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _lngController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Longitude (opsional)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
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
