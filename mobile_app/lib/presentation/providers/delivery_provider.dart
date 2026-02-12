import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/delivery_remote_datasource.dart';
import '../../data/models/delivery_order_model.dart';
import '../../data/repositories/delivery_repository.dart';
import 'auth_provider.dart';

final deliveryRepositoryProvider = Provider<DeliveryRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = DeliveryRemoteDataSource(storage);
  return DeliveryRepository(remote);
});

final deliveryOrdersProvider = FutureProvider<List<DeliveryOrderModel>>((ref) async {
  final repository = ref.read(deliveryRepositoryProvider);
  return repository.fetchDeliveryOrders();
});
