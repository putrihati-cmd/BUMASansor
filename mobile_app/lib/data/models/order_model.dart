import 'product_model.dart';
import 'warung_model.dart';
import 'warehouse_model.dart';

enum OrderStatus {
  pending,
  approved,
  preparing,
  inTransit,
  delivered,
  cancelled,
  unknown
}

OrderStatus orderStatusFromApi(String status) {
  try {
    return OrderStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == status.toUpperCase(),
        orElse: () => OrderStatus.unknown);
  } catch (_) {
    return OrderStatus.unknown;
  }
}

class OrderItemModel {
  final String id;
  final String productId;
  final ProductModel? product;
  final int quantity;
  final double price;
  final double subtotal;

  OrderItemModel({
    required this.id,
    required this.productId,
    this.product,
    required this.quantity,
    required this.price,
    required this.subtotal,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] as String,
      productId: json['productId'] as String,
      product: json['product'] != null
          ? ProductModel.fromJson(json['product'])
          : null,
      quantity: json['quantity'] as int,
      price: double.parse(json['price'].toString()),
      subtotal: double.parse(json['subtotal'].toString()),
    );
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final String warungId;
  final WarungModel? warung;
  final String warehouseId;
  final WarehouseModel? warehouse;
  final OrderStatus status;
  final double totalAmount;
  final List<OrderItemModel> items;
  final String? notes;
  final DateTime createdAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.warungId,
    this.warung,
    required this.warehouseId,
    this.warehouse,
    required this.status,
    required this.totalAmount,
    required this.items,
    this.notes,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    var itemsList = <OrderItemModel>[];
    if (json['items'] != null) {
      itemsList = (json['items'] as List)
          .map((i) => OrderItemModel.fromJson(i))
          .toList();
    }

    return OrderModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String,
      warungId: json['warungId'] as String,
      warung: json['warung'] != null
          ? WarungModel.fromJson(json['warung'])
          : null,
      warehouseId: json['warehouseId'] as String,
      status: orderStatusFromApi(json['status'] as String),
      totalAmount: double.parse(json['totalAmount'].toString()),
      items: itemsList,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
