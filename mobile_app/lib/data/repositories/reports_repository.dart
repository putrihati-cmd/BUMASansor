import '../datasources/remote/reports_remote_datasource.dart';
import '../models/dashboard_model.dart';

class ReportsRepository {
  ReportsRepository(this._remoteDataSource);

  final ReportsRemoteDataSource _remoteDataSource;

  Future<DashboardModel> fetchDashboard() {
    return _remoteDataSource.fetchDashboard();
  }
}
