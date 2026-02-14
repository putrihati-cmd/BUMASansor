import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/local/secure_storage_service.dart';
import '../../data/datasources/remote/auth_remote_datasource.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';

enum UserRole { admin, gudang, kurir, warung, unknown }

class AuthState {
  const AuthState({
    required this.loading,
    required this.isLoggedIn,
    required this.role,
    this.user,
    this.errorMessage,
  });

  final bool loading;
  final bool isLoggedIn;
  final UserRole role;
  final UserModel? user;
  final String? errorMessage;

  AuthState copyWith({
    bool? loading,
    bool? isLoggedIn,
    UserRole? role,
    UserModel? user,
    String? errorMessage,
  }) {
    return AuthState(
      loading: loading ?? this.loading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      role: role ?? this.role,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._authRepository, this._secureStorageService)
      : super(const AuthState(
            loading: true, isLoggedIn: false, role: UserRole.unknown));

  final AuthRepository _authRepository;
  final SecureStorageService _secureStorageService;

  Future<void> bootstrap() async {
    final isLoggedIn = await _authRepository.isLoggedIn();
    if (!isLoggedIn) {
      state = const AuthState(
          loading: false, isLoggedIn: false, role: UserRole.unknown);
      return;
    }

    final role = await _secureStorageService.getRole();
    final user = _authRepository.getStoredUser();

    state = AuthState(
      loading: false,
      isLoggedIn: true,
      role: _parseRole(role ?? user?.role),
      user: user,
    );
  }

  Future<void> login({required String email, required String password}) async {
    state = state.copyWith(loading: true, errorMessage: null);
    try {
      final response =
          await _authRepository.login(email: email, password: password);
      state = AuthState(
        loading: false,
        isLoggedIn: true,
        role: _parseRole(response.user.role),
        user: response.user,
      );
    } catch (error) {
      state = AuthState(
        loading: false,
        isLoggedIn: false,
        role: UserRole.unknown,
        user: null,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> mockLogin(UserRole role) async {
    await _secureStorageService.saveAuth(
        accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token');
    await _secureStorageService.saveRole(role.name);
    state = AuthState(
      loading: false,
      isLoggedIn: true,
      role: role,
      user: null,
    );
  }

  Future<void> logout() async {
    await _authRepository.logout();
    state = const AuthState(
        loading: false, isLoggedIn: false, role: UserRole.unknown);
  }

  UserRole _parseRole(String? role) {
    switch (role?.toLowerCase()) {
      case 'admin':
        return UserRole.admin;
      case 'gudang':
        return UserRole.gudang;
      case 'kurir':
        return UserRole.kurir;
      case 'warung':
        return UserRole.warung;
      default:
        return UserRole.unknown;
    }
  }
}

final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = AuthRemoteDataSource(storage);
  return AuthRepository(remote, storage);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.read(authRepositoryProvider);
  final storage = ref.read(secureStorageProvider);
  return AuthNotifier(repository, storage);
});

final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});
