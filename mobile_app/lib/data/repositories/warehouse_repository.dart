import '../datasources/local/hive_service.dart';
import '../datasources/remote/warehouse_remote_datasource.dart';

class WarehouseRepository {
  WarehouseRepository(this._remoteDataSource);

  final WarehouseRemoteDataSource _remoteDataSource;

  static const String _defaultWarehouseIdKey = 'default_warehouse_id';

  Future<String> getDefaultWarehouseId() async {
    final cached = HiveService.cacheBox.get(_defaultWarehouseIdKey);
    if (cached is String && cached.isNotEmpty) {
      return cached;
    }

    final warehouses = await _remoteDataSource.fetchWarehouses();
    if (warehouses.isEmpty) {
      throw Exception('No warehouses available');
    }

    final id = warehouses.first.id;
    await HiveService.cacheBox.put(_defaultWarehouseIdKey, id);
    return id;
  }

  Future<void> clearCache() async {
    await HiveService.cacheBox.delete(_defaultWarehouseIdKey);
  }
}