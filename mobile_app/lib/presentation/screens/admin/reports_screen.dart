import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/dashboard_model.dart';
import '../../../data/models/report_models.dart';
import '../../providers/reports_provider.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  DateTime? _dailyDate;
  DateTime? _monthlyDate;

  int _topDays = 30;
  int _topN = 10;

  String _warungPeriod = 'monthly';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _money(double value) => 'Rp ${value.toStringAsFixed(0)}';

  String? get _dailyDateParam {
    final d = _dailyDate;
    if (d == null) {
      return null;
    }
    final yyyy = d.year.toString().padLeft(4, '0');
    final mm = d.month.toString().padLeft(2, '0');
    final dd = d.day.toString().padLeft(2, '0');
    return '$yyyy-$mm-$dd';
  }

  String? get _monthParam {
    final d = _monthlyDate;
    final now = DateTime.now();
    final base = d ?? DateTime(now.year, now.month, 1);
    final yyyy = base.year.toString().padLeft(4, '0');
    final mm = base.month.toString().padLeft(2, '0');
    return '$yyyy-$mm';
  }

  Future<void> _pickDailyDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime(now.year - 5),
      lastDate: DateTime(now.year + 1),
      initialDate: _dailyDate ?? now,
    );
    if (picked == null) {
      return;
    }
    setState(() => _dailyDate = picked);
  }

  Future<void> _pickMonth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime(now.year - 5, 1, 1),
      lastDate: DateTime(now.year + 1, 12, 31),
      initialDate: _monthlyDate ?? DateTime(now.year, now.month, 1),
    );
    if (picked == null) {
      return;
    }
    setState(() => _monthlyDate = DateTime(picked.year, picked.month, 1));
  }

  @override
  Widget build(BuildContext context) {
    final dailyAsync = ref.watch(dailyReportProvider(_dailyDateParam));
    final monthlyAsync = ref.watch(monthlyReportProvider(_monthParam));
    final topAsync = ref.watch(
        topProductsProvider(TopProductsQuery(days: _topDays, top: _topN)));
    final warungAsync = ref.watch(warungPerformanceProvider(_warungPeriod));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan & Analitik'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Harian'),
            Tab(text: 'Bulanan'),
            Tab(text: 'Top Produk'),
            Tab(text: 'Warung'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _DailyTab(
            dateText: _dailyDateParam ?? 'Hari ini',
            onPickDate: _pickDailyDate,
            async: dailyAsync,
            money: _money,
          ),
          _MonthlyTab(
            monthText: _monthParam ?? '-',
            onPickMonth: _pickMonth,
            async: monthlyAsync,
            money: _money,
          ),
          _TopProductsTab(
            days: _topDays,
            topN: _topN,
            onDaysChanged: (v) => setState(() => _topDays = v),
            onTopChanged: (v) => setState(() => _topN = v),
            async: topAsync,
            money: _money,
          ),
          _WarungPerformanceTab(
            period: _warungPeriod,
            onPeriodChanged: (v) => setState(() => _warungPeriod = v),
            async: warungAsync,
            money: _money,
          ),
        ],
      ),
    );
  }
}

class _DailyTab extends StatelessWidget {
  const _DailyTab({
    required this.dateText,
    required this.onPickDate,
    required this.async,
    required this.money,
  });

  final String dateText;
  final VoidCallback onPickDate;
  final AsyncValue<DailyReportModel> async;
  final String Function(double) money;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
                child: Text('Tanggal: $dateText',
                    style: const TextStyle(fontWeight: FontWeight.bold))),
            OutlinedButton.icon(
              onPressed: onPickDate,
              icon: const Icon(Icons.date_range),
              label: const Text('Pilih'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        async.when(
          data: (report) {
            return Column(
              children: [
                _MetricCard(title: 'Omzet', value: money(report.omzet)),
                const SizedBox(height: 8),
                _MetricCard(
                    title: 'Paid (Sales)',
                    value: money(report.paid),
                    subtitle: '${report.transactions} transaksi'),
                const SizedBox(height: 8),
                _MetricCard(
                    title: 'Collections',
                    value: money(report.collected),
                    subtitle: '${report.paymentsCount} pembayaran'),
              ],
            );
          },
          loading: () => const Center(
              child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator())),
          error: (e, _) => Text('Gagal load laporan harian: $e'),
        ),
      ],
    );
  }
}

class _MonthlyTab extends StatelessWidget {
  const _MonthlyTab({
    required this.monthText,
    required this.onPickMonth,
    required this.async,
    required this.money,
  });

  final String monthText;
  final VoidCallback onPickMonth;
  final AsyncValue<MonthlyReportModel> async;
  final String Function(double) money;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
                child: Text('Periode: $monthText',
                    style: const TextStyle(fontWeight: FontWeight.bold))),
            OutlinedButton.icon(
              onPressed: onPickMonth,
              icon: const Icon(Icons.calendar_month),
              label: const Text('Pilih'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        async.when(
          data: (report) {
            return Column(
              children: [
                _MetricCard(
                    title: 'Omzet',
                    value: money(report.omzet),
                    subtitle: '${report.transactions} transaksi'),
                const SizedBox(height: 8),
                _MetricCard(title: 'Paid (Sales)', value: money(report.paid)),
                const SizedBox(height: 8),
                _MetricCard(
                    title: 'Receivables Created',
                    value: money(report.receivablesCreated)),
                const SizedBox(height: 8),
                _MetricCard(
                    title: 'Receivables Outstanding',
                    value: money(report.receivablesOutstanding)),
                const SizedBox(height: 8),
                _MetricCard(
                    title: 'Collections',
                    value: money(report.collectionsAmount)),
              ],
            );
          },
          loading: () => const Center(
              child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator())),
          error: (e, _) => Text('Gagal load laporan bulanan: $e'),
        ),
      ],
    );
  }
}

class _TopProductsTab extends StatelessWidget {
  const _TopProductsTab({
    required this.days,
    required this.topN,
    required this.onDaysChanged,
    required this.onTopChanged,
    required this.async,
    required this.money,
  });

  final int days;
  final int topN;
  final ValueChanged<int> onDaysChanged;
  final ValueChanged<int> onTopChanged;
  final AsyncValue<List<DashboardTopProduct>> async;
  final String Function(double) money;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
              child: InputDecorator(
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), labelText: 'Range (days)'),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    isExpanded: true,
                    value: days,
                    items: const [
                      DropdownMenuItem(value: 7, child: Text('7')),
                      DropdownMenuItem(value: 30, child: Text('30')),
                      DropdownMenuItem(value: 90, child: Text('90')),
                    ],
                    onChanged: (v) => v == null ? null : onDaysChanged(v),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: InputDecorator(
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), labelText: 'Top'),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    isExpanded: true,
                    value: topN,
                    items: const [
                      DropdownMenuItem(value: 5, child: Text('5')),
                      DropdownMenuItem(value: 10, child: Text('10')),
                      DropdownMenuItem(value: 20, child: Text('20')),
                    ],
                    onChanged: (v) => v == null ? null : onTopChanged(v),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        async.when(
          data: (items) {
            if (items.isEmpty) {
              return const Text('Tidak ada data.');
            }
            return Card(
              child: Column(
                children: items
                    .map(
                      (p) => ListTile(
                        dense: true,
                        leading: CircleAvatar(child: Text(p.rank.toString())),
                        title: Text(p.productName,
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle:
                            Text('${p.quantitySold} terjual | ${p.barcode}'),
                        trailing: Text(money(p.revenue)),
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
          error: (e, _) => Text('Gagal load top products: $e'),
        ),
      ],
    );
  }
}

class _WarungPerformanceTab extends StatelessWidget {
  const _WarungPerformanceTab({
    required this.period,
    required this.onPeriodChanged,
    required this.async,
    required this.money,
  });

  final String period;
  final ValueChanged<String> onPeriodChanged;
  final AsyncValue<WarungPerformanceResponse> async;
  final String Function(double) money;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        InputDecorator(
          decoration: const InputDecoration(
              border: OutlineInputBorder(), labelText: 'Periode'),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: period,
              items: const [
                DropdownMenuItem(
                    value: 'monthly', child: Text('Monthly (30 hari)')),
                DropdownMenuItem(
                    value: 'weekly', child: Text('Weekly (7 hari)')),
              ],
              onChanged: (v) => v == null ? null : onPeriodChanged(v),
            ),
          ),
        ),
        const SizedBox(height: 12),
        async.when(
          data: (result) {
            if (result.warungs.isEmpty) {
              return const Text('Tidak ada data.');
            }

            return Card(
              child: Column(
                children: result.warungs
                    .take(50)
                    .map(
                      (w) => ListTile(
                        dense: true,
                        title: Text(w.warungName,
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text(
                            'Score: ${w.paymentScore} | Orders: ${w.totalOrders} | ${w.status}'),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Buy: ${money(w.totalPurchase)}',
                                style: const TextStyle(fontSize: 11)),
                            Text('Pay: ${money(w.totalPayment)}',
                                style: const TextStyle(fontSize: 11)),
                            Text('Debt: ${money(w.currentDebt)}',
                                style: const TextStyle(fontSize: 11)),
                          ],
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
          error: (e, _) => Text('Gagal load warung performance: $e'),
        ),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.title, required this.value, this.subtitle});

  final String title;
  final String value;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!,
                        style: TextStyle(
                            color: Colors.grey.shade700, fontSize: 12)),
                  ],
                ],
              ),
            ),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
