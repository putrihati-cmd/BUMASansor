import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/restock_remote_datasource.dart';
import '../../data/models/order_model.dart';
import '../../data/models/product_model.dart';
import '../../data/repositories/restock_repository.dart';
import 'auth_provider.dart';
import 'warehouse_provider.dart';

// REPOSITORY PROVIDER
final restockRepositoryProvider = Provider<RestockRepository>((ref) {
  final secureStorage = ref.read(secureStorageProvider);
  final remoteDataSource = RestockRemoteDataSource(secureStorage);
  final warehouseRepo = ref.read(warehouseRepositoryProvider);
  return RestockRepository(remoteDataSource, warehouseRepo);
});

// CART STATE MODEL
class RestockCartItem {
  final ProductModel product;
  final int quantity;

  RestockCartItem({required this.product, required this.quantity});

  RestockCartItem copyWith({ProductModel? product, int? quantity}) {
    return RestockCartItem(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
    );
  }

  double get subtotal => product.buyPrice * quantity;
}

// CART NOTIFIER
class RestockCartNotifier extends StateNotifier<List<RestockCartItem>> {
  RestockCartNotifier() : super([]);

  void addItem(ProductModel product, {int quantity = 1}) {
    if (quantity <= 0) return;

    final index = state.indexWhere((item) => item.product.id == product.id);
    if (index >= 0) {
      final existing = state[index];
      final updated = existing.copyWith(quantity: existing.quantity + quantity);
      final next = [...state];
      next[index] = updated;
      state = next;
    } else {
      state = [...state, RestockCartItem(product: product, quantity: quantity)];
    }
  }

  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    final index = state.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      final existing = state[index];
      final next = [...state];
      next[index] = existing.copyWith(quantity: quantity);
      state = next;
    }
  }

  void removeItem(String productId) {
    state = state.where((item) => item.product.id != productId).toList();
  }

  void clear() {
    state = [];
  }
}

final restockCartProvider =
    StateNotifierProvider<RestockCartNotifier, List<RestockCartItem>>((ref) {
  return RestockCartNotifier();
});

final restockCartSubtotalProvider = Provider<double>((ref) {
  final cart = ref.watch(restockCartProvider);
  return cart.fold(0, (sum, item) => sum + item.subtotal);
});

// ORDER LIST PROVIDER
final restockOrdersProvider = FutureProvider<List<OrderModel>>((ref) async {
  final repo = ref.watch(restockRepositoryProvider);
  final user = ref.watch(currentUserProvider);
  
  if (user?.warungId == null) return [];

  return repo.listOrders(warungId: user!.warungId!);
});
