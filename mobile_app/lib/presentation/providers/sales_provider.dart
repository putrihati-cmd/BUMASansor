import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/sales_remote_datasource.dart';
import '../../data/repositories/sales_repository.dart';
import 'auth_provider.dart';
import 'warehouse_provider.dart';

final salesRepositoryProvider = Provider<SalesRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = SalesRemoteDataSource(storage);
  final warehouseRepo = ref.read(warehouseRepositoryProvider);
  return SalesRepository(remote, warehouseRepo);
});
