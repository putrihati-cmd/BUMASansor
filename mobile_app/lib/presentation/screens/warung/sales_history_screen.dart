import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:intl/intl.dart';

import '../../../data/datasources/local/hive_service.dart';
import '../../../data/models/sale_model.dart';
import '../../../data/models/sync_task_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/sales_provider.dart';
import 'receipt_screen.dart';

class SalesHistoryScreen extends ConsumerStatefulWidget {
  const SalesHistoryScreen({super.key});

  @override
  ConsumerState<SalesHistoryScreen> createState() => _SalesHistoryScreenState();
}

class _SalesHistoryScreenState extends ConsumerState<SalesHistoryScreen> {
  DateTimeRange? _range;

  Future<List<SaleModel>> _loadSales(String warungId) {
    final repo = ref.read(salesRepositoryProvider);

    String? dateFrom;
    String? dateTo;

    if (_range != null) {
      final start = DateTime(_range!.start.year, _range!.start.month, _range!.start.day);
      final end = DateTime(_range!.end.year, _range!.end.month, _range!.end.day, 23, 59, 59);
      dateFrom = start.toIso8601String();
      dateTo = end.toIso8601String();
    }

    return repo.listSales(
      warungId: warungId,
      dateFrom: dateFrom,
      dateTo: dateTo,
      limit: 100,
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
        title: const Text('Riwayat Transaksi'),
        actions: [
          IconButton(
            tooltip: 'Filter Tanggal',
            onPressed: () async {
              final picked = await showDateRangePicker(
                context: context,
                firstDate: DateTime(2020),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (picked == null) {
                return;
              }
              setState(() {
                _range = picked;
              });
            },
            icon: const Icon(Icons.date_range),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ValueListenableBuilder<Box<dynamic>>(
              valueListenable: HiveService.syncQueueBox.listenable(),
              builder: (context, Box<dynamic> box, child) {
                final tasks = box.values
                    .map((value) => SyncTaskModel.fromJson(value as Map<dynamic, dynamic>))
                    .where((t) => t.endpoint == '/sales' && t.method.toUpperCase() == 'POST')
                    .toList();

                if (tasks.isEmpty) {
                  return const SizedBox.shrink();
                }

                return Card(
                  color: Colors.orange.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Pending Offline: ${tasks.length}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        ...tasks.take(5).map((task) {
                          final createdAt = task.createdAt;
                          final amount = _totalFromPayload(task.payload);
                          return Text(
                            '- ${DateFormat('MM-dd HH:mm').format(createdAt)} - Rp ${amount.toStringAsFixed(0)}',
                          );
                        }),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            Expanded(
              child: FutureBuilder<List<SaleModel>>(
                future: _loadSales(warungId),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.hasError) {
                    return Center(child: Text('Gagal load riwayat: ${snapshot.error}'));
                  }

                  final sales = snapshot.data ?? const [];
                  if (sales.isEmpty) {
                    return const Center(child: Text('Belum ada transaksi.'));
                  }

                  return ListView.separated(
                    itemCount: sales.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final sale = sales[index];
                      return ListTile(
                        title: Text(sale.invoiceNumber),
                        subtitle: Text(DateFormat('yyyy-MM-dd HH:mm').format(sale.createdAt)),
                        trailing: Text('Rp ${sale.totalAmount.toStringAsFixed(0)}'),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => ReceiptScreen(sale: sale)),
                          );
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _totalFromPayload(Map<String, dynamic> payload) {
    final items = payload['items'];
    if (items is! List) {
      return 0;
    }

    var total = 0.0;
    for (final item in items) {
      if (item is! Map) {
        continue;
      }
      final qty = int.tryParse(item['quantity'].toString()) ?? 0;
      final price = double.tryParse(item['price'].toString()) ?? 0;
      total += qty * price;
    }

    return total;
  }
}