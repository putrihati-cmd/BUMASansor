import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/dashboard_model.dart';
import '../../models/report_models.dart';
import '../local/secure_storage_service.dart';

class ReportsRemoteDataSource {
  ReportsRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<DashboardModel> fetchDashboard() async {
    final response = await _dio.get('/reports/dashboard');
    final data = response.data['data'] as Map<String, dynamic>;
    return DashboardModel.fromJson(data);
  }

  Future<DailyReportModel> fetchDaily({String? date}) async {
    final response = await _dio.get('/reports/daily', queryParameters: {'date': date});
    final data = response.data['data'] as Map<String, dynamic>;
    return DailyReportModel.fromJson(data);
  }

  Future<MonthlyReportModel> fetchMonthly({String? month}) async {
    final response = await _dio.get('/reports/monthly', queryParameters: {'month': month});
    final data = response.data['data'] as Map<String, dynamic>;
    return MonthlyReportModel.fromJson(data);
  }

  Future<List<DashboardTopProduct>> fetchTopProducts({int days = 30, int top = 10}) async {
    final response = await _dio.get('/reports/top-products', queryParameters: {'days': days, 'top': top});
    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data.map((row) => DashboardTopProduct.fromJson(row as Map<String, dynamic>)).toList();
  }

  Future<WarungPerformanceResponse> fetchWarungPerformance({String period = 'monthly'}) async {
    final response = await _dio.get('/reports/warungs', queryParameters: {'period': period});
    final data = response.data['data'] as Map<String, dynamic>;
    return WarungPerformanceResponse.fromJson(data);
  }
}
