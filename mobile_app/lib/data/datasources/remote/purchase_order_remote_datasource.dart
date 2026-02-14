import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/purchase_order_model.dart';
import '../local/secure_storage_service.dart';

class PurchaseOrderRemoteDataSource {
  PurchaseOrderRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<PurchaseOrderModel>> fetchPurchaseOrders({String? status, String? supplierId}) async {
    final response = await _dio.get(
      '/purchase-orders',
      queryParameters: {
        'status': status,
        'supplierId': supplierId,
      },
    );

    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data.map((row) => PurchaseOrderModel.fromJson(row as Map<String, dynamic>)).toList();
  }

  Future<void> receivePurchaseOrder(String id) async {
    await _dio.post('/purchase-orders/$id/receive');
  }
}
