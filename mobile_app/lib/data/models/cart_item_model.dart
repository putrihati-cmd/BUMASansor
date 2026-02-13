import 'product_model.dart';

class CartItemModel {
  CartItemModel({
    required this.product,
    required this.quantity,
    this.discount = 0,
  });

  final ProductModel product;
  final int quantity;

  // Discount for this line (absolute amount), not percentage.
  final double discount;

  CartItemModel copyWith({
    ProductModel? product,
    int? quantity,
    double? discount,
  }) {
    return CartItemModel(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      discount: discount ?? this.discount,
    );
  }

  double get subtotal {
    final value = (product.sellPrice * quantity) - discount;
    return value < 0 ? 0 : value;
  }
}