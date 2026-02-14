import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../config/api_config.dart';
import 'api_interceptor.dart';
import '../../data/datasources/local/secure_storage_service.dart';

class DioClient {
  DioClient(this._secureStorageService);

  final SecureStorageService _secureStorageService;
  Dio? _dio;

  Dio get instance {
    if (_dio != null) {
      return _dio!;
    }

    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio!.interceptors.add(ApiInterceptor(_secureStorageService));
    _dio!.interceptors
        .add(PrettyDioLogger(requestBody: true, requestHeader: true));

    return _dio!;
  }
}
