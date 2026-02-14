import '../datasources/remote/reports_remote_datasource.dart';
import '../models/dashboard_model.dart';
import '../models/report_models.dart';

class ReportsRepository {
  ReportsRepository(this._remoteDataSource);

  final ReportsRemoteDataSource _remoteDataSource;

  Future<DashboardModel> fetchDashboard() {
    return _remoteDataSource.fetchDashboard();
  }

  Future<DailyReportModel> fetchDaily({String? date}) {
    return _remoteDataSource.fetchDaily(date: date);
  }

  Future<MonthlyReportModel> fetchMonthly({String? month}) {
    return _remoteDataSource.fetchMonthly(month: month);
  }

  Future<List<DashboardTopProduct>> fetchTopProducts(
      {int days = 30, int top = 10}) {
    return _remoteDataSource.fetchTopProducts(days: days, top: top);
  }

  Future<WarungPerformanceResponse> fetchWarungPerformance(
      {String period = 'monthly'}) {
    return _remoteDataSource.fetchWarungPerformance(period: period);
  }
}
