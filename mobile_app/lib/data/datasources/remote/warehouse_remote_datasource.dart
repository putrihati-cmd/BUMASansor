import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/warehouse_model.dart';
import '../local/secure_storage_service.dart';

class WarehouseRemoteDataSource {
  WarehouseRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<WarehouseModel>> fetchWarehouses() async {
    final response = await _dio.get('/warehouses');
    final payload = response.data['data'] as List<dynamic>;
    return payload
        .map((item) => WarehouseModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}