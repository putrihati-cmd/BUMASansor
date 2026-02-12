import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _roleKey = 'user_role';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveAuth({required String accessToken, required String refreshToken}) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);

  Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);

  Future<void> saveRole(String role) => _storage.write(key: _roleKey, value: role);

  Future<String?> getRole() => _storage.read(key: _roleKey);

  Future<void> clear() => _storage.deleteAll();
}
