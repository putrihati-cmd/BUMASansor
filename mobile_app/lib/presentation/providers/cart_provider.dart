import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/cart_item_model.dart';
import '../../data/models/product_model.dart';

class CartNotifier extends StateNotifier<List<CartItemModel>> {
  CartNotifier() : super(const []);

  void addProduct(WarungProductModel product, {int quantity = 1}) {
    if (quantity <= 0) {
      return;
    }

    final index = state.indexWhere((item) => item.warungProduct.id == product.id);
    if (index >= 0) {
      final existing = state[index];
      final updated = existing.copyWith(quantity: existing.quantity + quantity);
      final next = [...state];
      next[index] = updated;
      state = next;
      return;
    }

    state = [...state, CartItemModel(warungProduct: product, quantity: quantity)];
  }

  void updateQuantity(String warungProductId, int quantity) {
    if (quantity <= 0) {
      removeProduct(warungProductId);
      return;
    }

    state = state
        .map(
          (item) => item.warungProduct.id == warungProductId
              ? item.copyWith(quantity: quantity)
              : item,
        )
        .toList();
  }

  void removeProduct(String warungProductId) {
    state = state.where((item) => item.warungProduct.id != warungProductId).toList();
  }

  void clear() {
    state = const [];
  }

  double get subtotal {
    return state.fold(0, (sum, item) => sum + item.subtotal);
  }

  int get totalItems {
    return state.fold(0, (sum, item) => sum + item.quantity);
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItemModel>>(
  (ref) => CartNotifier(),
);

final cartSubtotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider.notifier).subtotal;
});

final cartTotalItemsProvider = Provider<int>((ref) {
  return ref.watch(cartProvider.notifier).totalItems;
});
