import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/warung_model.dart';
import '../local/secure_storage_service.dart';

class WarungRemoteDataSource {
  WarungRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<WarungModel>> fetchWarungs({
    String? search,
    bool? blocked,
    int page = 1,
    int limit = 100,
  }) async {
    final response = await _dio.get(
      '/warungs',
      queryParameters: {
        'search':
            (search == null || search.trim().isEmpty) ? null : search.trim(),
        'blocked': blocked,
        'page': page,
        'limit': limit,
      },
    );

    final data = response.data['data'] as Map<String, dynamic>;
    final items = (data['items'] as List<dynamic>? ?? const []).cast<dynamic>();

    return items
        .map((item) => WarungModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<WarungModel> fetchWarungById(String id) async {
    final response = await _dio.get('/warungs/$id');
    final data = response.data['data'] as Map<String, dynamic>;
    return WarungModel.fromJson(data);
  }

  Future<WarungModel> createWarung(Map<String, dynamic> payload) async {
    final response = await _dio.post('/warungs', data: payload);
    final data = response.data['data'] as Map<String, dynamic>;
    return WarungModel.fromJson(data);
  }

  Future<WarungModel> updateWarung(
      String id, Map<String, dynamic> payload) async {
    final response = await _dio.put('/warungs/$id', data: payload);
    final data = response.data['data'] as Map<String, dynamic>;
    return WarungModel.fromJson(data);
  }

  Future<void> deleteWarung(String id) async {
    await _dio.delete('/warungs/$id');
  }

  Future<WarungModel> blockWarung(String id, {required String reason}) async {
    final response =
        await _dio.put('/warungs/$id/block', data: {'reason': reason});
    final data = response.data['data'] as Map<String, dynamic>;
    return WarungModel.fromJson(data);
  }

  Future<WarungModel> unblockWarung(String id) async {
    final response = await _dio.put('/warungs/$id/unblock');
    final data = response.data['data'] as Map<String, dynamic>;
    return WarungModel.fromJson(data);
  }

  Future<WarungCreditStatusModel> fetchCreditStatus(String id) async {
    final response = await _dio.get('/warungs/$id/credit-status');
    final data = response.data['data'] as Map<String, dynamic>;
    return WarungCreditStatusModel.fromJson(data);
  }
}
