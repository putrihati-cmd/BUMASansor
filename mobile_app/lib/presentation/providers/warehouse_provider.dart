import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/warehouse_remote_datasource.dart';
import '../../data/models/warehouse_model.dart';
import '../../data/repositories/warehouse_repository.dart';
import 'auth_provider.dart';

final warehouseRepositoryProvider = Provider<WarehouseRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = WarehouseRemoteDataSource(storage);
  return WarehouseRepository(remote);
});

final warehouseListProvider = FutureProvider<List<WarehouseModel>>((ref) async {
  final repo = ref.read(warehouseRepositoryProvider);
  return repo.fetchWarehouses();
});
