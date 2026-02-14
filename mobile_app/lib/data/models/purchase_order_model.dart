import 'product_model.dart';
import 'supplier_model.dart';
import 'warehouse_model.dart';

class PurchaseOrderModel {
  PurchaseOrderModel({
    required this.id,
    required this.poNumber,
    required this.status,
    required this.totalAmount,
    required this.supplier,
    required this.warehouse,
    required this.items,
    this.notes,
    this.createdAt,
  });

  final String id;
  final String poNumber;
  final String status;
  final double totalAmount;
  final SupplierModel supplier;
  final WarehouseModel warehouse;
  final List<PurchaseOrderItemModel> items;
  final String? notes;
  final DateTime? createdAt;

  factory PurchaseOrderModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) => double.tryParse(value?.toString() ?? '0') ?? 0;

    final supplierJson = json['supplier'] as Map<String, dynamic>? ?? const {};
    final warehouseJson = json['warehouse'] as Map<String, dynamic>? ?? const {};
    final itemsJson = (json['items'] as List<dynamic>? ?? const []).cast<dynamic>();

    return PurchaseOrderModel(
      id: json['id'] as String,
      poNumber: json['poNumber'] as String? ?? '-',
      status: json['status'] as String? ?? '-',
      totalAmount: toDouble(json['totalAmount']),
      supplier: SupplierModel.fromJson(supplierJson),
      warehouse: WarehouseModel.fromJson(warehouseJson),
      items: itemsJson
          .whereType<Map<String, dynamic>>()
          .map((item) => PurchaseOrderItemModel.fromJson(item))
          .toList(),
      notes: json['notes'] as String?,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}

class PurchaseOrderItemModel {
  PurchaseOrderItemModel({
    required this.id,
    required this.productId,
    required this.quantity,
    required this.price,
    required this.subtotal,
    required this.product,
  });

  final String id;
  final String productId;
  final int quantity;
  final double price;
  final double subtotal;
  final ProductModel product;

  factory PurchaseOrderItemModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) => double.tryParse(value?.toString() ?? '0') ?? 0;

    final productJson = json['product'] as Map<String, dynamic>? ?? const {};

    return PurchaseOrderItemModel(
      id: json['id'] as String,
      productId: json['productId'] as String? ?? (productJson['id'] as String? ?? '-'),
      quantity: int.tryParse(json['quantity']?.toString() ?? '0') ?? 0,
      price: toDouble(json['price']),
      subtotal: toDouble(json['subtotal']),
      product: ProductModel.fromJson(productJson),
    );
  }
}
