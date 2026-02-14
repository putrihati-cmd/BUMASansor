import 'package:dio/dio.dart';

import '../config/api_config.dart';
import '../../data/datasources/local/secure_storage_service.dart';

class ApiInterceptor extends Interceptor {
  ApiInterceptor(this._secureStorageService);

  final SecureStorageService _secureStorageService;

  // Single-flight refresh to avoid spamming refresh endpoint.
  Future<void>? _refreshing;

  @override
  Future<void> onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _secureStorageService.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  @override
  Future<void> onError(
      DioException err, ErrorInterceptorHandler handler) async {
    final status = err.response?.statusCode;
    final requestOptions = err.requestOptions;

    final isAuthEndpoint = requestOptions.path.contains('/auth/login') ||
        requestOptions.path.contains('/auth/refresh');
    final alreadyRetried = requestOptions.extra['retried'] == true;

    if (status == 401 && !alreadyRetried && !isAuthEndpoint) {
      try {
        await _refreshTokens();
        final newToken = await _secureStorageService.getAccessToken();
        if (newToken == null || newToken.isEmpty) {
          return handler.next(err);
        }

        final response = await _retry(requestOptions, newToken);
        return handler.resolve(response);
      } catch (_) {
        // If refresh fails, clear local auth state so UI can re-login.
        await _secureStorageService.clear();
        return handler.next(err);
      }
    }

    handler.next(err);
  }

  Future<void> _refreshTokens() {
    _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
    return _refreshing!;
  }

  Future<void> _doRefresh() async {
    final refreshToken = await _secureStorageService.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      throw Exception('No refresh token');
    }

    final dio = Dio(
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

    final response = await dio.post(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
      options: Options(extra: {'skipAuthRefresh': true}),
    );

    final data = response.data['data'] as Map<String, dynamic>;
    final accessToken = data['accessToken'] as String;
    final newRefreshToken = data['refreshToken'] as String;
    final user = data['user'] as Map<String, dynamic>;

    await _secureStorageService.saveAuth(
        accessToken: accessToken, refreshToken: newRefreshToken);
    await _secureStorageService
        .saveRole((user['role'] as String).toLowerCase());
  }

  Future<Response<dynamic>> _retry(
      RequestOptions requestOptions, String token) {
    final dio = Dio(
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

    final headers = Map<String, dynamic>.from(requestOptions.headers);
    headers['Authorization'] = 'Bearer $token';

    return dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: Options(
        method: requestOptions.method,
        headers: headers,
        responseType: requestOptions.responseType,
        contentType: requestOptions.contentType,
        followRedirects: requestOptions.followRedirects,
        validateStatus: requestOptions.validateStatus,
        receiveDataWhenStatusError: requestOptions.receiveDataWhenStatusError,
        extra: {...requestOptions.extra, 'retried': true},
      ),
    );
  }
}
