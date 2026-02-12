import '../datasources/local/secure_storage_service.dart';
import '../datasources/remote/auth_remote_datasource.dart';
import '../models/auth_response_model.dart';

class AuthRepository {
  AuthRepository(this._remoteDataSource, this._secureStorageService);

  final AuthRemoteDataSource _remoteDataSource;
  final SecureStorageService _secureStorageService;

  Future<AuthResponseModel> login({required String email, required String password}) async {
    final response = await _remoteDataSource.login(email: email, password: password);
    await _secureStorageService.saveAuth(
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    );
    await _secureStorageService.saveRole(response.user.role.toLowerCase());
    return response;
  }

  Future<void> logout() => _secureStorageService.clear();
}
