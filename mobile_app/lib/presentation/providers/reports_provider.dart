import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/dashboard_model.dart';
import '../../data/models/report_models.dart';
import 'dashboard_provider.dart';

final dailyReportProvider = FutureProvider.family<DailyReportModel, String?>((ref, date) async {
  final repo = ref.read(reportsRepositoryProvider);
  return repo.fetchDaily(date: date);
});

final monthlyReportProvider = FutureProvider.family<MonthlyReportModel, String?>((ref, month) async {
  final repo = ref.read(reportsRepositoryProvider);
  return repo.fetchMonthly(month: month);
});

class TopProductsQuery {
  const TopProductsQuery({this.days = 30, this.top = 10});

  final int days;
  final int top;

  @override
  bool operator ==(Object other) {
    return other is TopProductsQuery && other.days == days && other.top == top;
  }

  @override
  int get hashCode => Object.hash(days, top);
}

final topProductsProvider = FutureProvider.family<List<DashboardTopProduct>, TopProductsQuery>((ref, query) async {
  final repo = ref.read(reportsRepositoryProvider);
  return repo.fetchTopProducts(days: query.days, top: query.top);
});

final warungPerformanceProvider = FutureProvider.family<WarungPerformanceResponse, String>((ref, period) async {
  final repo = ref.read(reportsRepositoryProvider);
  return repo.fetchWarungPerformance(period: period);
});
