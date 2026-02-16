import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../models/order_model.dart';
import '../local/secure_storage_service.dart';

class RestockRemoteDataSource {
  RestockRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<OrderModel> createOrder({
    required String warungId,
    required String warehouseId,
    required List<Map<String, dynamic>> items,
    String? notes,
  }) async {
    final response = await _dio.post('/orders', data: {
      'warungId': warungId,
      'warehouseId': warehouseId,
      'items': items,
      'notes': notes,
    });
    // Assuming backend returns { data: order }
    // If backend returns the order directly, remove ['data']. 
    // Usually NestJS + interceptor returns { data: ... }
    return OrderModel.fromJson(response.data['data']);
  }

  Future<List<OrderModel>> listOrders({
    required String warungId,
    String? status,
  }) async {
    final response = await _dio.get('/orders', queryParameters: {
      'warungId': warungId,
      if (status != null) 'status': status,
    });
    final list = response.data['data'] as List;
    return list.map((e) => OrderModel.fromJson(e)).toList();
  }
}
