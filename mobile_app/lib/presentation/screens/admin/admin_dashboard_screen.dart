import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Admin'),
        actions: [
          IconButton(
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
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: dashboardAsync.when(
          data: (dashboard) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('KPI Hari Ini', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Text('- Transaksi: ${dashboard.transactions}'),
                Text('- Omzet: Rp ${dashboard.omzet.toStringAsFixed(0)}'),
                Text('- Piutang berjalan: Rp ${dashboard.outstandingReceivables.toStringAsFixed(0)}'),
                Text('- Alert stok menipis: ${dashboard.lowStockCount}'),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stackTrace) => Text('Gagal load dashboard: $error'),
        ),
      ),
    );
  }
}
