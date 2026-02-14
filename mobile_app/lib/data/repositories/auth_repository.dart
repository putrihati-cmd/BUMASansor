import '../datasources/local/hive_service.dart';
import '../datasources/local/secure_storage_service.dart';
import '../datasources/remote/auth_remote_datasource.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

class AuthRepository {
  AuthRepository(this._remoteDataSource, this._secureStorageService);

  final AuthRemoteDataSource _remoteDataSource;
  final SecureStorageService _secureStorageService;

  static const String _userKey = 'user_data';

  Future<AuthResponseModel> login(
      {required String email, required String password}) async {
    final response =
        await _remoteDataSource.login(email: email, password: password);

    await _secureStorageService.saveAuth(
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    );
    await _secureStorageService.saveRole(response.user.role.toLowerCase());
    await saveUser(response.user);

    return response;
  }

  Future<AuthResponseModel> refreshAuthToken() async {
    final refreshToken = await _secureStorageService.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      throw Exception('No refresh token');
    }

    final response = await _remoteDataSource.refreshToken(refreshToken);

    await _secureStorageService.saveAuth(
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    );
    await _secureStorageService.saveRole(response.user.role.toLowerCase());
    await saveUser(response.user);

    return response;
  }

  Future<void> saveUser(UserModel user) async {
    await HiveService.authBox.put(_userKey, user.toJson());
  }

  UserModel? getStoredUser() {
    final json = HiveService.authBox.get(_userKey);
    if (json is Map) {
      return UserModel.fromJson(Map<String, dynamic>.from(json));
    }
    return null;
  }

  Future<bool> isLoggedIn() async {
    final token = await _secureStorageService.getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    await _secureStorageService.clear();
    await HiveService.authBox.delete(_userKey);
  }
}
