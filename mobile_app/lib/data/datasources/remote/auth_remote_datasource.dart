import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../../models/auth_response_model.dart';
import '../local/secure_storage_service.dart';

class AuthRemoteDataSource {
  AuthRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<AuthResponseModel> login({required String email, required String password}) async {
    final response = await _dio.post('/auth/login', data: {'email': email, 'password': password});

    final data = response.data['data'] as Map<String, dynamic>;
    return AuthResponseModel.fromJson(data);
  }

  Future<AuthResponseModel> refreshToken(String refreshToken) async {
    final response = await _dio.post('/auth/refresh', data: {'refreshToken': refreshToken});
    final data = response.data['data'] as Map<String, dynamic>;
    return AuthResponseModel.fromJson(data);
  }
}
