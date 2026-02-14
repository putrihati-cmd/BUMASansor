import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../data/models/sale_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/sales_provider.dart';

class DailySummaryScreen extends ConsumerStatefulWidget {
  const DailySummaryScreen({super.key});

  @override
  ConsumerState<DailySummaryScreen> createState() => _DailySummaryScreenState();
}

class _DailySummaryScreenState extends ConsumerState<DailySummaryScreen> {
  DateTime _date = DateTime.now();

  Future<List<SaleModel>> _load(String warungId) {
    final repo = ref.read(salesRepositoryProvider);

    final start = DateTime(_date.year, _date.month, _date.day);
    final end = DateTime(_date.year, _date.month, _date.day, 23, 59, 59);

    return repo.listSales(
      warungId: warungId,
      dateFrom: start.toIso8601String(),
      dateTo: end.toIso8601String(),
      limit: 200,
    );
  }

  @override
  Widget build(BuildContext context) {
    final warungId = ref.watch(currentUserProvider)?.warungId;

    if (warungId == null || warungId.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('WarungId tidak tersedia.')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ringkasan Harian'),
        actions: [
          IconButton(
            tooltip: 'Pilih Tanggal',
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                firstDate: DateTime(2020),
                lastDate: DateTime.now().add(const Duration(days: 365)),
                initialDate: _date,
              );
              if (picked == null) {
                return;
              }
              setState(() {
                _date = picked;
              });
            },
            icon: const Icon(Icons.date_range),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: FutureBuilder<List<SaleModel>>(
          future: _load(warungId),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(child: Text('Gagal load: ${snapshot.error}'));
            }

            final sales = snapshot.data ?? const [];
            final totalTx = sales.length;
            final totalAmount =
                sales.fold(0.0, (sum, s) => sum + s.totalAmount);

            final csv = _toCsv(sales);

            return ListView(
              children: [
                Text('Tanggal: ${DateFormat('yyyy-MM-dd').format(_date)}'),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total transaksi: $totalTx'),
                        const SizedBox(height: 6),
                        Text(
                            'Total omzet: Rp ${totalAmount.toStringAsFixed(0)}'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () async {
                    await Clipboard.setData(ClipboardData(text: csv));
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content:
                                Text('CSV disalin (bisa paste ke Excel).')),
                      );
                    }
                  },
                  icon: const Icon(Icons.download),
                  label: const Text('Export CSV (Copy)'),
                ),
                const SizedBox(height: 12),
                const Text('Daftar transaksi',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ...sales.map(
                  (s) => ListTile(
                    title: Text(s.invoiceNumber),
                    subtitle: Text(DateFormat('HH:mm').format(s.createdAt)),
                    trailing: Text('Rp ${s.totalAmount.toStringAsFixed(0)}'),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  String _toCsv(List<SaleModel> sales) {
    final sb = StringBuffer();
    sb.writeln('invoice_number,created_at,total_amount,payment_method');
    for (final s in sales) {
      sb.writeln(
        '${s.invoiceNumber},${s.createdAt.toIso8601String()},${s.totalAmount.toStringAsFixed(0)},${paymentMethodToApi(s.paymentMethod)}',
      );
    }
    return sb.toString();
  }
}
