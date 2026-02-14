import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/user_model.dart';
import '../local/secure_storage_service.dart';

class UserRemoteDataSource {
  UserRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<List<UserModel>> fetchUsers() async {
    final response = await _dio.get('/users');
    final data = (response.data['data'] ?? []) as List<dynamic>;
    return data
        .map((row) => UserModel.fromJson(row as Map<String, dynamic>))
        .toList();
  }
}
