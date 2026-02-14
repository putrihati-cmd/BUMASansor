import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/stock_model.dart';
import '../local/secure_storage_service.dart';

class StockRemoteDataSource {
  StockRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<StockModel>> fetchStocks({String? warehouseId, String? productId, bool? lowStock}) async {
    final response = await _dio.get(
      '/stocks',
      queryParameters: {
        'warehouseId': warehouseId,
        'productId': productId,
        'lowStock': lowStock,
      },
    );

    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data.map((row) => StockModel.fromJson(row as Map<String, dynamic>)).toList();
  }

  Future<List<StockModel>> fetchLowStockAlerts() async {
    final response = await _dio.get('/stocks/alerts/low-stock');
    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data.map((row) => StockModel.fromJson(row as Map<String, dynamic>)).toList();
  }

  Future<List<StockMovementModel>> fetchMovementHistory({
    String? warehouseId,
    String? productId,
    String? movementType,
  }) async {
    final response = await _dio.get(
      '/stocks/movements/history',
      queryParameters: {
        'warehouseId': warehouseId,
        'productId': productId,
        'movementType': movementType,
      },
    );

    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data.map((row) => StockMovementModel.fromJson(row as Map<String, dynamic>)).toList();
  }

  Future<void> performOpname({
    required String warehouseId,
    required String productId,
    required int actualQty,
    required String reason,
  }) async {
    await _dio.post(
      '/stocks/opname',
      data: {
        'warehouseId': warehouseId,
        'productId': productId,
        'actualQty': actualQty,
        'reason': reason,
      },
    );
  }
}
