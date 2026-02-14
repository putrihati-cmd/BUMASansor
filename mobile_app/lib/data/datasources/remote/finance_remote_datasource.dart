import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/receivable_model.dart';
import '../local/secure_storage_service.dart';

class FinanceRemoteDataSource {
  FinanceRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<ReceivableListResponse> fetchReceivables({
    String? warungId,
    String? status,
    bool? overdueOnly,
    int page = 1,
    int limit = 50,
  }) async {
    final response = await _dio.get(
      '/finance/receivables',
      queryParameters: {
        'warungId': warungId,
        'status': status,
        'overdueOnly': overdueOnly,
        'page': page,
        'limit': limit,
      },
    );

    final data = response.data['data'] as Map<String, dynamic>;
    return ReceivableListResponse.fromJson(data);
  }

  Future<Map<String, dynamic>> createPayment(
      Map<String, dynamic> payload) async {
    final response = await _dio.post('/finance/payments', data: payload);
    return response.data['data'] as Map<String, dynamic>;
  }
}
