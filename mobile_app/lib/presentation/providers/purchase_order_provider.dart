import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/purchase_order_remote_datasource.dart';
import '../../data/models/purchase_order_model.dart';
import '../../data/repositories/purchase_order_repository.dart';
import 'auth_provider.dart';

final purchaseOrderRepositoryProvider = Provider<PurchaseOrderRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = PurchaseOrderRemoteDataSource(storage);
  return PurchaseOrderRepository(remote);
});

final purchaseOrderListProvider = FutureProvider.family<List<PurchaseOrderModel>, String?>((ref, status) async {
  final repo = ref.read(purchaseOrderRepositoryProvider);
  return repo.fetchPurchaseOrders(status: status);
});

final approvedPurchaseOrdersProvider = FutureProvider<List<PurchaseOrderModel>>((ref) async {
  final repo = ref.read(purchaseOrderRepositoryProvider);
  return repo.fetchPurchaseOrders(status: 'APPROVED');
});
