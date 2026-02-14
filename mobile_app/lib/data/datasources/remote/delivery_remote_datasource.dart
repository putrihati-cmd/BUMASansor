import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/delivery_order_model.dart';
import '../local/secure_storage_service.dart';

class DeliveryRemoteDataSource {
  DeliveryRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<DeliveryOrderModel>> fetchDeliveryOrders({
    String? status,
    String? warungId,
    String? kurirId,
  }) async {
    final response = await _dio.get(
      '/delivery-orders',
      queryParameters: {
        'status': status,
        'warungId': warungId,
        'kurirId': kurirId,
      },
    );
    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data
        .map(
            (item) => DeliveryOrderModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<DeliveryOrderModel> fetchDeliveryOrderById(String id) async {
    final response = await _dio.get('/delivery-orders/$id');
    final data = response.data['data'] as Map<String, dynamic>;
    return DeliveryOrderModel.fromJson(data);
  }

  Future<DeliveryOrderModel> createDeliveryOrder(
      Map<String, dynamic> payload) async {
    final response = await _dio.post('/delivery-orders', data: payload);
    final data = response.data['data'] as Map<String, dynamic>;
    return DeliveryOrderModel.fromJson(data);
  }

  Future<void> assignKurir(String id, String kurirId) async {
    await _dio
        .put('/delivery-orders/$id/assign-kurir', data: {'kurirId': kurirId});
  }

  Future<void> startDelivery(String id) async {
    await _dio.put('/delivery-orders/$id/start-delivery');
  }

  Future<void> markDelivered(String id) async {
    await _dio.put('/delivery-orders/$id/mark-delivered');
  }

  Future<void> confirmDelivery(String id, {String? photoProof}) async {
    await _dio
        .post('/delivery-orders/$id/confirm', data: {'photoProof': photoProof});
  }
}
