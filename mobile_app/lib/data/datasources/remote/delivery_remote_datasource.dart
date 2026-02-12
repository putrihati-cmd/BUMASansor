import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/delivery_order_model.dart';
import '../local/secure_storage_service.dart';

class DeliveryRemoteDataSource {
  DeliveryRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<DeliveryOrderModel>> fetchDeliveryOrders({String? status}) async {
    final response = await _dio.get('/delivery-orders', queryParameters: {'status': status});
    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data
        .map((item) => DeliveryOrderModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
