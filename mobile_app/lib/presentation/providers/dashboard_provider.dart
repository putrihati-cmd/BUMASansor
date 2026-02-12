import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/reports_remote_datasource.dart';
import '../../data/models/dashboard_model.dart';
import '../../data/repositories/reports_repository.dart';
import 'auth_provider.dart';

final reportsRepositoryProvider = Provider<ReportsRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = ReportsRemoteDataSource(storage);
  return ReportsRepository(remote);
});

final dashboardProvider = FutureProvider<DashboardModel>((ref) async {
  final repository = ref.read(reportsRepositoryProvider);
  return repository.fetchDashboard();
});
