import 'dart:typed_data';

import 'package:dio/dio.dart';

import '../../../core/network/dio_client.dart';
import '../local/secure_storage_service.dart';

class UploadRemoteDataSource {
  UploadRemoteDataSource(SecureStorageService secureStorageService)
      : _dio = DioClient(secureStorageService).instance;

  final Dio _dio;

  Future<String> uploadBytes(Uint8List bytes,
      {required String filename}) async {
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: filename),
    });

    final response = await _dio.post(
      '/uploads',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    final data = response.data['data'] as Map<String, dynamic>;
    return data['url'] as String? ?? data['path'] as String? ?? '';
  }
}
