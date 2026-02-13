import 'package:bumas_app/data/models/auth_response_model.dart';
import 'package:bumas_app/data/models/user_model.dart';
import 'package:bumas_app/presentation/providers/auth_provider.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

import 'mocks.mocks.dart';

void main() {
  test('bootstrap sets unauthenticated when not logged in', () async {
    final repo = MockAuthRepository();
    final storage = MockSecureStorageService();
    final notifier = AuthNotifier(repo, storage);

    when(repo.isLoggedIn()).thenAnswer((_) async => false);

    await notifier.bootstrap();

    expect(notifier.state.loading, false);
    expect(notifier.state.isLoggedIn, false);
    expect(notifier.state.role, UserRole.unknown);
  });

  test('bootstrap sets role and user when logged in', () async {
    final repo = MockAuthRepository();
    final storage = MockSecureStorageService();
    final notifier = AuthNotifier(repo, storage);

    final user = UserModel(
      id: 'u1',
      email: 'warung@bumas.local',
      name: 'Warung',
      role: 'WARUNG',
      warungId: 'w1',
    );

    when(repo.isLoggedIn()).thenAnswer((_) async => true);
    when(storage.getRole()).thenAnswer((_) async => 'warung');
    when(repo.getStoredUser()).thenReturn(user);

    await notifier.bootstrap();

    expect(notifier.state.loading, false);
    expect(notifier.state.isLoggedIn, true);
    expect(notifier.state.role, UserRole.warung);
    expect(notifier.state.user?.id, 'u1');
  });

  test('login sets authenticated state on success', () async {
    final repo = MockAuthRepository();
    final storage = MockSecureStorageService();
    final notifier = AuthNotifier(repo, storage);

    final user = UserModel(
      id: 'u2',
      email: 'admin@bumas.local',
      name: 'Admin',
      role: 'ADMIN',
      warungId: null,
    );

    when(repo.login(email: 'admin@bumas.local', password: 'secret')).thenAnswer(
      (_) async => AuthResponseModel(accessToken: 'a', refreshToken: 'r', user: user),
    );

    await notifier.login(email: 'admin@bumas.local', password: 'secret');

    expect(notifier.state.loading, false);
    expect(notifier.state.isLoggedIn, true);
    expect(notifier.state.role, UserRole.admin);
    expect(notifier.state.user?.id, 'u2');
  });

  test('login sets errorMessage on failure', () async {
    final repo = MockAuthRepository();
    final storage = MockSecureStorageService();
    final notifier = AuthNotifier(repo, storage);

    when(repo.login(email: 'x', password: 'y')).thenThrow(Exception('bad creds'));

    await notifier.login(email: 'x', password: 'y');

    expect(notifier.state.loading, false);
    expect(notifier.state.isLoggedIn, false);
    expect(notifier.state.errorMessage, contains('bad creds'));
  });
}