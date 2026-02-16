import '../datasources/remote/restock_remote_datasource.dart';
import '../models/order_model.dart';
import 'warehouse_repository.dart';

class RestockRepository {
  RestockRepository(this._remoteDataSource, this._warehouseRepository);

  final RestockRemoteDataSource _remoteDataSource;
  final WarehouseRepository _warehouseRepository;

  Future<OrderModel> createOrder({
    required String warungId,
    required List<Map<String, dynamic>> items,
    String? notes,
  }) async {
    // Determine the warehouse ID (e.g., default warehouse or based on warung location)
    // For now, get default warehouse from local cache/repo
    final warehouseId = await _warehouseRepository.getDefaultWarehouseId();

    return _remoteDataSource.createOrder(
      warungId: warungId,
      warehouseId: warehouseId,
      items: items,
      notes: notes,
    );
  }

  Future<List<OrderModel>> listOrders({
    required String warungId,
    String? status,
  }) {
    return _remoteDataSource.listOrders(warungId: warungId, status: status);
  }
}
