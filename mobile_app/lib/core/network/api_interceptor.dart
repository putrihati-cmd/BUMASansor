import 'package:dio/dio.dart';

import '../../data/datasources/local/secure_storage_service.dart';

class ApiInterceptor extends Interceptor {
  ApiInterceptor(this._secureStorageService);

  final SecureStorageService _secureStorageService;

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _secureStorageService.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    super.onRequest(options, handler);
  }
}
