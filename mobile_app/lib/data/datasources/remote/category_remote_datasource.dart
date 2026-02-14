import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/product_model.dart';
import '../local/secure_storage_service.dart';

class CategoryRemoteDataSource {
  CategoryRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<CategoryModel>> fetchCategories() async {
    final response = await _dio.get('/categories');
    final data = (response.data['data'] as List<dynamic>? ?? const []).cast<dynamic>();
    return data
        .map((item) => CategoryModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}