import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/sales_remote_datasource.dart';
import '../../data/datasources/remote/warehouse_remote_datasource.dart';
import '../../data/repositories/sales_repository.dart';
import '../../data/repositories/warehouse_repository.dart';
import 'auth_provider.dart';

final warehouseRepositoryProvider = Provider<WarehouseRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = WarehouseRemoteDataSource(storage);
  return WarehouseRepository(remote);
});

final salesRepositoryProvider = Provider<SalesRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = SalesRemoteDataSource(storage);
  final warehouseRepo = ref.read(warehouseRepositoryProvider);
  return SalesRepository(remote, warehouseRepo);
});