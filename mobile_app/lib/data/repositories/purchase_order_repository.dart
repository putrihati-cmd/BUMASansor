import '../datasources/remote/purchase_order_remote_datasource.dart';
import '../models/purchase_order_model.dart';

class PurchaseOrderRepository {
  PurchaseOrderRepository(this._remoteDataSource);

  final PurchaseOrderRemoteDataSource _remoteDataSource;

  Future<List<PurchaseOrderModel>> fetchPurchaseOrders(
      {String? status, String? supplierId}) {
    return _remoteDataSource.fetchPurchaseOrders(
        status: status, supplierId: supplierId);
  }

  Future<void> receivePurchaseOrder(String id) {
    return _remoteDataSource.receivePurchaseOrder(id);
  }
}
