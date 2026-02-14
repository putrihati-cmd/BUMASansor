import 'dart:async';
import 'dart:math';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../data/models/dashboard_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/dashboard_card.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  Timer? _autoRefreshTimer;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();

    // Auto refresh dashboard every 30s (pragmatic real-time).
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      ref.invalidate(dashboardProvider);
    });
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  void _onNavTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    switch (index) {
      case 0:
        // Stay on dashboard.
        break;
      case 1:
        context.go('/admin/warungs');
        break;
      case 2:
        context.go('/admin/products');
        break;
      case 3:
        context.go('/admin/reports');
        break;
    }
  }

  Future<void> _logout() async {
    await ref.read(authProvider.notifier).logout();
    if (!mounted) {
      return;
    }
    context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(dashboardProvider),
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: _logout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardProvider);
          // Give provider time to re-run.
          await Future<void>.delayed(const Duration(milliseconds: 200));
        },
        child: dashboardAsync.when(
          data: (dashboard) => _DashboardBody(dashboard: dashboard),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('Gagal load dashboard: $error'),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => ref.invalidate(dashboardProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onNavTapped,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.store), label: 'Warung'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2), label: 'Produk'),
          BottomNavigationBarItem(icon: Icon(Icons.assessment), label: 'Laporan'),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/admin/create-do'),
        icon: const Icon(Icons.local_shipping),
        label: const Text('Buat DO'),
      ),
    );
  }
}

class _DashboardBody extends StatelessWidget {
  const _DashboardBody({required this.dashboard});

  final DashboardModel dashboard;

  String _money(double value) {
    return 'Rp ${value.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    final today = dashboard.today;
    final monthly = dashboard.chart?.omzetBulanan;

    final labaText = today.profitEstimate > 0 ? _money(today.profitEstimate) : 'N/A';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Ringkasan Hari Ini', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: DashboardCard(
                title: 'Omzet',
                value: _money(today.omzet),
                icon: Icons.attach_money,
                color: Colors.green,
                subtitle: '${today.transactions} transaksi',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DashboardCard(
                title: 'Kas (Paid)',
                value: _money(today.cashIn),
                icon: Icons.account_balance,
                color: Colors.purple,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: DashboardCard(
                title: 'Piutang',
                value: _money(dashboard.receivables.outstanding),
                icon: Icons.account_balance_wallet,
                color: Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DashboardCard(
                title: 'Laba (estimasi)',
                value: labaText,
                icon: Icons.trending_up,
                color: Colors.blue,
                subtitle: today.profitEstimate > 0 ? null : 'Belum tersedia dari backend',
              ),
            ),
          ],
        ),
        if (monthly != null && monthly.labels.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),
          const Text('Omzet & Pengeluaran (12 bulan)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 18, 12),
              child: SizedBox(
                height: 220,
                child: _buildMonthlyChart(monthly),
              ),
            ),
          ),
        ],
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 8),
        const Text('Warung', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: DashboardCard(
                title: 'Aktif',
                value: dashboard.warungs.active.toString(),
                icon: Icons.store,
                color: Colors.green,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DashboardCard(
                title: 'Blocked',
                value: dashboard.warungs.blocked.toString(),
                icon: Icons.block,
                color: Colors.red,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text('Stok', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: DashboardCard(
                title: 'Low stock',
                value: dashboard.stocks.lowStockCount.toString(),
                icon: Icons.warning_amber,
                color: Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DashboardCard(
                title: 'Total value',
                value: _money(dashboard.stocks.totalValue),
                icon: Icons.inventory,
                color: Colors.blueGrey,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 8),
        const Text('Produk Terlaris (30 hari)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (dashboard.topProducts.isEmpty)
          const Text('Belum ada data top produk.'),
        if (dashboard.topProducts.isNotEmpty)
          Card(
            child: Column(
              children: dashboard.topProducts
                  .take(5)
                  .map(
                    (p) => ListTile(
                      dense: true,
                      leading: CircleAvatar(child: Text(p.rank.toString())),
                      title: Text(p.productName, maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text('${p.quantitySold} terjual - ${p.barcode}'),
                      trailing: Text(_money(p.revenue)),
                    ),
                  )
                  .toList(),
            ),
          ),
        const SizedBox(height: 16),
        const Text('Aksi Cepat', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _QuickAction(
              title: 'Manajemen Warung',
              icon: Icons.store,
              onTap: () => context.go('/admin/warungs'),
            ),
            _QuickAction(
              title: 'Manajemen Produk',
              icon: Icons.inventory_2,
              onTap: () => context.go('/admin/products'),
            ),
            _QuickAction(
              title: 'Buat Delivery Order',
              icon: Icons.local_shipping,
              onTap: () => context.go('/admin/create-do'),
            ),
            _QuickAction(
              title: 'Verifikasi Bayar',
              icon: Icons.payment,
              onTap: () => context.go('/admin/verify-payments'),
            ),
            _QuickAction(
              title: 'Laporan',
              icon: Icons.assessment,
              onTap: () => context.go('/admin/reports'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMonthlyChart(DashboardMonthlyChart chart) {
    final length = chart.labels.length;
    final values = [...chart.omzet, ...chart.pengeluaran];
    final maxSeries = values.isEmpty ? 0.0 : values.reduce((a, b) => a > b ? a : b);
    final maxY = max(1.0, maxSeries * 1.1).toDouble();
    final interval = length <= 6 ? 1.0 : (length / 6).ceilToDouble();

    List<FlSpot> toSpots(List<double> series) {
      return List<FlSpot>.generate(
        length,
        (index) => FlSpot(index.toDouble(), index < series.length ? series[index] : 0),
      );
    }

    return LineChart(
      LineChartData(
        minX: 0,
        maxX: max(0, length - 1).toDouble(),
        minY: 0,
        maxY: maxY,
        gridData: const FlGridData(show: true),
        borderData: FlBorderData(show: false),
        lineTouchData: const LineTouchData(enabled: true),
        titlesData: FlTitlesData(
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: true, reservedSize: 46),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: interval,
              getTitlesWidget: (value, meta) {
                final index = value.round();
                if (index < 0 || index >= chart.labels.length) {
                  return const SizedBox.shrink();
                }
                final label = chart.labels[index];
                final short = label.length >= 7 ? label.substring(5) : label;
                return SideTitleWidget(
                  meta: meta,
                  space: 6,
                  child: Text(short, style: const TextStyle(fontSize: 10)),
                );
              },
            ),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: toSpots(chart.omzet),
            isCurved: false,
            color: Colors.green,
            barWidth: 2,
            dotData: const FlDotData(show: false),
          ),
          LineChartBarData(
            spots: toSpots(chart.pengeluaran),
            isCurved: false,
            color: Colors.orange,
            barWidth: 2,
            dotData: const FlDotData(show: false),
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 170,
      child: Card(
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon),
                const SizedBox(height: 8),
                Text(title, textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
