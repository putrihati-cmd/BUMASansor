import 'product_model.dart';
import 'warehouse_model.dart';

class StockModel {
  StockModel({
    required this.id,
    required this.warehouseId,
    required this.productId,
    required this.quantity,
    required this.minStock,
    required this.warehouse,
    required this.product,
    this.updatedAt,
  });

  final String id;
  final String warehouseId;
  final String productId;
  final int quantity;
  final int minStock;
  final WarehouseModel warehouse;
  final ProductModel product;
  final DateTime? updatedAt;

  bool get isLowStock => quantity < minStock;

  factory StockModel.fromJson(Map<String, dynamic> json) {
    final warehouseJson = json['warehouse'] as Map<String, dynamic>? ?? const {};
    final productJson = json['product'] as Map<String, dynamic>? ?? const {};

    final updated = DateTime.tryParse(json['updatedAt']?.toString() ?? '');

    return StockModel(
      id: json['id'] as String,
      warehouseId: json['warehouseId'] as String? ?? (warehouseJson['id'] as String? ?? '-'),
      productId: json['productId'] as String? ?? (productJson['id'] as String? ?? '-'),
      quantity: int.tryParse(json['quantity']?.toString() ?? '0') ?? 0,
      minStock: int.tryParse(json['minStock']?.toString() ?? '10') ?? 10,
      warehouse: WarehouseModel.fromJson(warehouseJson),
      product: ProductModel.fromJson(productJson),
      updatedAt: updated,
    );
  }
}

class StockMovementModel {
  StockMovementModel({
    required this.id,
    required this.movementType,
    required this.productId,
    required this.productName,
    required this.quantity,
    this.fromWarehouseName,
    this.toWarehouseName,
    this.referenceType,
    this.referenceId,
    this.notes,
    this.createdAt,
  });

  final String id;
  final String movementType;
  final String productId;
  final String productName;
  final int quantity;
  final String? fromWarehouseName;
  final String? toWarehouseName;
  final String? referenceType;
  final String? referenceId;
  final String? notes;
  final DateTime? createdAt;

  factory StockMovementModel.fromJson(Map<String, dynamic> json) {
    final productJson = json['product'] as Map<String, dynamic>?;
    final fromWarehouseJson = json['fromWarehouse'] as Map<String, dynamic>?;
    final toWarehouseJson = json['toWarehouse'] as Map<String, dynamic>?;

    return StockMovementModel(
      id: json['id'] as String,
      movementType: json['movementType'] as String? ?? '-',
      productId: json['productId'] as String? ?? (productJson?['id'] as String? ?? '-'),
      productName: productJson?['name'] as String? ?? '-',
      quantity: int.tryParse(json['quantity']?.toString() ?? '0') ?? 0,
      fromWarehouseName: fromWarehouseJson?['name'] as String?,
      toWarehouseName: toWarehouseJson?['name'] as String?,
      referenceType: json['referenceType'] as String?,
      referenceId: json['referenceId'] as String?,
      notes: json['notes'] as String?,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}
