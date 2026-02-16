import 'product_model.dart';

class CartItemModel {
  CartItemModel({
    required this.warungProduct,
    required this.quantity,
    this.discount = 0,
  });

  final WarungProductModel warungProduct;
  final int quantity;

  // Discount for this line (absolute amount), not percentage.
  final double discount;

  CartItemModel copyWith({
    WarungProductModel? warungProduct,
    int? quantity,
    double? discount,
  }) {
    return CartItemModel(
      warungProduct: warungProduct ?? this.warungProduct,
      quantity: quantity ?? this.quantity,
      discount: discount ?? this.discount,
    );
  }

  double get subtotal {
    final value = (warungProduct.sellingPrice * quantity) - discount;
    return value < 0 ? 0 : value;
  }
}
