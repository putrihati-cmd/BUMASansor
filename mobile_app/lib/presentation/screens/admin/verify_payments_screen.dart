import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/receivable_model.dart';
import '../../providers/finance_provider.dart';

class VerifyPaymentsScreen extends ConsumerStatefulWidget {
  const VerifyPaymentsScreen({super.key});

  @override
  ConsumerState<VerifyPaymentsScreen> createState() =>
      _VerifyPaymentsScreenState();
}

class _VerifyPaymentsScreenState extends ConsumerState<VerifyPaymentsScreen> {
  String? _status;
  bool _overdueOnly = false;

  ReceivableQuery get _query {
    return ReceivableQuery(
      status: _status,
      overdueOnly: _overdueOnly ? true : null,
      page: 1,
      limit: 100,
    );
  }

  String _money(double value) => 'Rp ${value.toStringAsFixed(0)}';

  Future<void> _createPayment(ReceivableModel receivable) async {
    final amountController =
        TextEditingController(text: receivable.balance.toStringAsFixed(0));
    String method = 'TRANSFER';

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Catat Pembayaran'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                      'Warung: ${receivable.warung?.name ?? receivable.warungId}'),
                  const SizedBox(height: 8),
                  Text('Sisa tagihan: ${_money(receivable.balance)}'),
                  const SizedBox(height: 12),
                  TextField(
                    controller: amountController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Jumlah bayar',
                    ),
                  ),
                  const SizedBox(height: 12),
                  InputDecorator(
                    decoration: const InputDecoration(
                        border: OutlineInputBorder(), labelText: 'Metode'),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        value: method,
                        items: const [
                          DropdownMenuItem(value: 'CASH', child: Text('Cash')),
                          DropdownMenuItem(
                              value: 'TRANSFER', child: Text('Transfer')),
                          DropdownMenuItem(value: 'QRIS', child: Text('QRIS')),
                        ],
                        onChanged: (value) {
                          if (value == null) {
                            return;
                          }
                          setState(() => method = value);
                        },
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Batal')),
                FilledButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: const Text('Simpan')),
              ],
            );
          },
        );
      },
    );

    final amount = double.tryParse(amountController.text.trim()) ?? 0;
    amountController.dispose();

    if (ok != true) {
      return;
    }
    if (!mounted) {
      return;
    }

    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Jumlah bayar harus > 0.')));
      return;
    }
    if (amount > receivable.balance) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Jumlah bayar melebihi sisa tagihan.')));
      return;
    }

    try {
      final repo = ref.read(financeRepositoryProvider);
      await repo.createPayment(
        receivableId: receivable.id,
        amount: amount,
        method: method,
      );

      if (!mounted) {
        return;
      }

      ref.invalidate(receivableListProvider(_query));
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Pembayaran tercatat.')));
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Gagal mencatat: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final receivablesAsync = ref.watch(receivableListProvider(_query));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verifikasi / Catat Pembayaran'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(receivableListProvider(_query)),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: InputDecorator(
                    decoration: const InputDecoration(
                        border: OutlineInputBorder(), labelText: 'Status'),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String?>(
                        isExpanded: true,
                        value: _status,
                        items: const [
                          DropdownMenuItem(value: null, child: Text('Semua')),
                          DropdownMenuItem(
                              value: 'UNPAID', child: Text('UNPAID')),
                          DropdownMenuItem(
                              value: 'PARTIAL', child: Text('PARTIAL')),
                          DropdownMenuItem(
                              value: 'OVERDUE', child: Text('OVERDUE')),
                          DropdownMenuItem(value: 'PAID', child: Text('PAID')),
                        ],
                        onChanged: (value) => setState(() => _status = value),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                FilterChip(
                  selected: _overdueOnly,
                  label: const Text('Overdue only'),
                  onSelected: (v) => setState(() => _overdueOnly = v),
                ),
              ],
            ),
          ),
          Expanded(
            child: receivablesAsync.when(
              data: (result) {
                final items = result.items;
                if (items.isEmpty) {
                  return const Center(child: Text('Tidak ada receivable.'));
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(receivableListProvider(_query));
                    await Future<void>.delayed(
                        const Duration(milliseconds: 200));
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.only(bottom: 24),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final r = items[index];
                      final warungName = r.warung?.name ?? r.warungId;
                      final subtitle =
                          'Due: ${r.dueDate.toIso8601String().substring(0, 10)} | ${r.status}';

                      return ListTile(
                        title: Text(warungName,
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text(subtitle),
                        leading: CircleAvatar(
                          child: Text(warungName.isEmpty
                              ? '?'
                              : warungName[0].toUpperCase()),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(_money(r.balance),
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            OutlinedButton(
                              onPressed: r.balance <= 0
                                  ? null
                                  : () => _createPayment(r),
                              child: const Text('Bayar'),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) =>
                  Center(child: Text('Gagal load receivables: $e')),
            ),
          ),
        ],
      ),
    );
  }
}
