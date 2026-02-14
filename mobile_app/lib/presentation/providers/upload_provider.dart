import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/upload_remote_datasource.dart';
import '../../data/repositories/upload_repository.dart';
import 'auth_provider.dart';

final uploadRepositoryProvider = Provider<UploadRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = UploadRemoteDataSource(storage);
  return UploadRepository(remote);
});

