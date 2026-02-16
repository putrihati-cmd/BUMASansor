import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/product_model.dart';
import '../local/secure_storage_service.dart';

class ProductRemoteDataSource {
  ProductRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<ProductModel>> fetchProducts({String? search}) async {
    final response =
        await _dio.get('/products', queryParameters: {'search': search});
    final payload = response.data['data']['items'] as List<dynamic>;
    return payload
        .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<WarungProductModel>> fetchWarungProducts(String warungId) async {
    final response = await _dio.get('/warungs/$warungId/products');
    final payload = response.data['data'] as List<dynamic>;
    return payload
        .map((item) => WarungProductModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<ProductModel> fetchByBarcode(String barcode) async {
    final response = await _dio.get('/products/barcode/$barcode');
    final data = response.data['data'] as Map<String, dynamic>;
    return ProductModel.fromJson(data);
  }

  Future<ProductModel> fetchById(String id) async {
    final response = await _dio.get('/products/$id');
    final data = response.data['data'] as Map<String, dynamic>;
    return ProductModel.fromJson(data);
  }

  Future<ProductModel> createProduct(Map<String, dynamic> payload) async {
    final response = await _dio.post('/products', data: payload);
    final data = response.data['data'] as Map<String, dynamic>;
    return ProductModel.fromJson(data);
  }

  Future<ProductModel> updateProduct(
      String id, Map<String, dynamic> payload) async {
    final response = await _dio.put('/products/$id', data: payload);
    final data = response.data['data'] as Map<String, dynamic>;
    return ProductModel.fromJson(data);
  }

  Future<void> deleteProduct(String id) async {
    await _dio.delete('/products/$id');
  }
}
