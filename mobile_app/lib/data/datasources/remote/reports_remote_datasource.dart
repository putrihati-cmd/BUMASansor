import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/dashboard_model.dart';
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
}
