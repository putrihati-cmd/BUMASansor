import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/sale_model.dart';
import '../local/secure_storage_service.dart';

class SalesRemoteDataSource {
  SalesRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<SaleModel> createSale(Map<String, dynamic> payload) async {
    final response = await _dio.post('/sales', data: payload);
    final data = response.data['data'] as Map<String, dynamic>;
    return SaleModel.fromJson(data);
  }

  Future<List<SaleModel>> listSales({
    String? warungId,
    String? dateFrom,
    String? dateTo,
    int page = 1,
    int limit = 50,
  }) async {
    final response = await _dio.get(
      '/sales',
      queryParameters: {
        'warungId': warungId,
        'dateFrom': dateFrom,
        'dateTo': dateTo,
        'page': page,
        'limit': limit,
      },
    );

    final payload = response.data['data']['items'] as List<dynamic>;
    return payload
        .map((item) => SaleModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<SaleModel> getSale(String id) async {
    final response = await _dio.get('/sales/$id');
    final data = response.data['data'] as Map<String, dynamic>;
    return SaleModel.fromJson(data);
  }
}