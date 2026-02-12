import '../datasources/remote/delivery_remote_datasource.dart';
import '../models/delivery_order_model.dart';

class DeliveryRepository {
  DeliveryRepository(this._remoteDataSource);

  final DeliveryRemoteDataSource _remoteDataSource;

  Future<List<DeliveryOrderModel>> fetchDeliveryOrders({String? status}) {
    return _remoteDataSource.fetchDeliveryOrders(status: status);
  }
}
