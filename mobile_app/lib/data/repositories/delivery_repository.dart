import '../datasources/remote/delivery_remote_datasource.dart';
import '../models/delivery_order_model.dart';

class DeliveryRepository {
  DeliveryRepository(this._remoteDataSource);

  final DeliveryRemoteDataSource _remoteDataSource;

  Future<List<DeliveryOrderModel>> fetchDeliveryOrders({
    String? status,
    String? warungId,
    String? kurirId,
  }) {
    return _remoteDataSource.fetchDeliveryOrders(
        status: status, warungId: warungId, kurirId: kurirId);
  }

  Future<DeliveryOrderModel> fetchDeliveryOrderById(String id) {
    return _remoteDataSource.fetchDeliveryOrderById(id);
  }

  Future<DeliveryOrderModel> createDeliveryOrder({
    required String warungId,
    required String warehouseId,
    required List<Map<String, dynamic>> items,
    int? creditDays,
    String? notes,
  }) {
    return _remoteDataSource.createDeliveryOrder({
      'warungId': warungId,
      'warehouseId': warehouseId,
      'items': items,
      if (creditDays != null) 'creditDays': creditDays,
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    });
  }

  Future<void> assignKurir(String id, String kurirId) {
    return _remoteDataSource.assignKurir(id, kurirId);
  }

  Future<void> startDelivery(String id) {
    return _remoteDataSource.startDelivery(id);
  }

  Future<void> markDelivered(String id) {
    return _remoteDataSource.markDelivered(id);
  }

  Future<void> confirmDelivery(String id, {String? photoProof}) {
    return _remoteDataSource.confirmDelivery(id, photoProof: photoProof);
  }
}
