import 'dart:io';

import 'package:bumas_app/data/datasources/local/hive_service.dart';
import 'package:bumas_app/data/models/auth_response_model.dart';
import 'package:bumas_app/data/models/user_model.dart';
import 'package:bumas_app/data/repositories/auth_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:mockito/mockito.dart';

import 'mocks.mocks.dart';

void main() {
  late Directory hiveDir;

  setUpAll(() async {
    hiveDir = await Directory.systemTemp.createTemp('bumas_hive_test_');
    Hive.init(hiveDir.path);
    await HiveService.init();
  });

  tearDownAll(() async {
    await Hive.close();
    await hiveDir.delete(recursive: true);
  });

  setUp(() async {
    await HiveService.authBox.clear();
  });

  test('login saves tokens, role, and user to hive', () async {
    final remote = MockAuthRemoteDataSource();
    final storage = MockSecureStorageService();
    final repo = AuthRepository(remote, storage);

    final user = UserModel(
      id: 'u1',
      email: 'warung@bumas.local',
      name: 'Warung',
      role: 'WARUNG',
      warungId: 'w1',
    );

    final response = AuthResponseModel(
      accessToken: 'access',
      refreshToken: 'refresh',
      user: user,
    );

    when(remote.login(email: 'warung@bumas.local', password: 'secret'))
        .thenAnswer((_) async => response);
    when(storage.saveAuth(accessToken: 'access', refreshToken: 'refresh'))
        .thenAnswer((_) async {});
    when(storage.saveRole('warung')).thenAnswer((_) async {});

    final result =
        await repo.login(email: 'warung@bumas.local', password: 'secret');

    expect(result.accessToken, 'access');
    expect(result.refreshToken, 'refresh');

    verify(storage.saveAuth(accessToken: 'access', refreshToken: 'refresh'))
        .called(1);
    verify(storage.saveRole('warung')).called(1);

    final stored = repo.getStoredUser();
    expect(stored, isNotNull);
    expect(stored!.id, 'u1');
    expect(stored.warungId, 'w1');
  });

  test('refreshAuthToken uses refresh token and updates stored auth', () async {
    final remote = MockAuthRemoteDataSource();
    final storage = MockSecureStorageService();
    final repo = AuthRepository(remote, storage);

    final user = UserModel(
      id: 'u2',
      email: 'admin@bumas.local',
      name: 'Admin',
      role: 'ADMIN',
      warungId: null,
    );

    final response = AuthResponseModel(
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: user,
    );

    when(storage.getRefreshToken()).thenAnswer((_) async => 'old-refresh');
    when(remote.refreshToken('old-refresh')).thenAnswer((_) async => response);
    when(storage.saveAuth(
            accessToken: 'new-access', refreshToken: 'new-refresh'))
        .thenAnswer((_) async {});
    when(storage.saveRole('admin')).thenAnswer((_) async {});

    final result = await repo.refreshAuthToken();

    expect(result.accessToken, 'new-access');
    expect(result.refreshToken, 'new-refresh');

    verify(storage.saveAuth(
            accessToken: 'new-access', refreshToken: 'new-refresh'))
        .called(1);
    verify(storage.saveRole('admin')).called(1);

    final stored = repo.getStoredUser();
    expect(stored, isNotNull);
    expect(stored!.id, 'u2');
    expect(stored.role, 'ADMIN');
  });

  test('logout clears secure storage and deletes stored user', () async {
    final remote = MockAuthRemoteDataSource();
    final storage = MockSecureStorageService();
    final repo = AuthRepository(remote, storage);

    await HiveService.authBox.put('user_data', {
      'id': 'u3',
      'email': 'x@x.com',
      'name': 'X',
      'role': 'WARUNG',
      'warungId': 'w3',
    });

    when(storage.clear()).thenAnswer((_) async {});

    await repo.logout();

    verify(storage.clear()).called(1);
    expect(HiveService.authBox.get('user_data'), isNull);
  });
}
