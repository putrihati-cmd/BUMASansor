import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/delivery_remote_datasource.dart';
import '../../data/models/delivery_order_model.dart';
import '../../data/repositories/delivery_repository.dart';
import 'auth_provider.dart';

class DeliveryQuery {
  const DeliveryQuery({this.status, this.warungId, this.kurirId});

  final String? status;
  final String? warungId;
  final String? kurirId;

  @override
  bool operator ==(Object other) {
    return other is DeliveryQuery &&
        other.status == status &&
        other.warungId == warungId &&
        other.kurirId == kurirId;
  }

  @override
  int get hashCode => Object.hash(status, warungId, kurirId);
}

final deliveryRepositoryProvider = Provider<DeliveryRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = DeliveryRemoteDataSource(storage);
  return DeliveryRepository(remote);
});

final deliveryListProvider = FutureProvider.family<List<DeliveryOrderModel>, DeliveryQuery>((ref, query) async {
  final repository = ref.read(deliveryRepositoryProvider);
  return repository.fetchDeliveryOrders(status: query.status, warungId: query.warungId, kurirId: query.kurirId);
});

final deliveryDetailProvider = FutureProvider.family<DeliveryOrderModel, String>((ref, id) async {
  final repository = ref.read(deliveryRepositoryProvider);
  return repository.fetchDeliveryOrderById(id);
});

final deliveryProvider = StateNotifierProvider<DeliveryNotifier, AsyncValue<List<DeliveryOrderModel>>>((ref) {
  final repository = ref.read(deliveryRepositoryProvider);
  return DeliveryNotifier(repository);
});

class DeliveryNotifier extends StateNotifier<AsyncValue<List<DeliveryOrderModel>>> {
  DeliveryNotifier(this._repository) : super(const AsyncValue.loading());

  final DeliveryRepository _repository;

  String? _status;
  String? _warungId;
  String? _kurirId;

  Future<void> loadDeliveries({String? status, String? warungId, String? kurirId}) async {
    _status = status;
    _warungId = warungId;
    _kurirId = kurirId;

    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() {
      return _repository.fetchDeliveryOrders(status: status, warungId: warungId, kurirId: kurirId);
    });
  }

  Future<void> refresh() async {
    await loadDeliveries(status: _status, warungId: _warungId, kurirId: _kurirId);
  }

  Future<void> startDelivery(String id) async {
    await _repository.startDelivery(id);
    await refresh();
  }

  Future<void> markDelivered(String id) async {
    await _repository.markDelivered(id);
    await refresh();
  }
}
