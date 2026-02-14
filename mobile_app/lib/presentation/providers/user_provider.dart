import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/user_remote_datasource.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/user_repository.dart';
import 'auth_provider.dart';

final userRepositoryProvider = Provider<UserRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = UserRemoteDataSource(storage);
  return UserRepository(remote);
});

final userListProvider = FutureProvider<List<UserModel>>((ref) async {
  final repo = ref.read(userRepositoryProvider);
  return repo.fetchUsers();
});

final kurirListProvider = FutureProvider<List<UserModel>>((ref) async {
  final users = await ref.watch(userListProvider.future);
  return users.where((u) => u.role.toUpperCase() == 'KURIR').toList();
});
