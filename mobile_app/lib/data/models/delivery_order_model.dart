class DeliveryOrderModel {
  DeliveryOrderModel({
    required this.id,
    required this.doNumber,
    required this.status,
    required this.warung,
    required this.items,
    required this.totalAmount,
    this.warehouseId,
    this.kurirId,
    this.creditDays,
    this.dueDate,
    this.notes,
    this.photoProof,
    this.createdAt,
  });

  final String id;
  final String doNumber;
  final String status;
  final DeliveryWarungModel warung;
  final List<DeliveryOrderItemModel> items;
  final double totalAmount;

  final String? warehouseId;
  final String? kurirId;
  final int? creditDays;
  final DateTime? dueDate;
  final String? notes;
  final String? photoProof;
  final DateTime? createdAt;

  String get warungName => warung.name;

  factory DeliveryOrderModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) => double.tryParse(value?.toString() ?? '0') ?? 0;

    final warungJson = (json['warung'] as Map<String, dynamic>? ?? const {});
    final itemsJson = (json['items'] as List<dynamic>? ?? const []).cast<dynamic>();

    DateTime? parseDate(dynamic value) {
      if (value == null) {
        return null;
      }
      return DateTime.tryParse(value.toString());
    }

    return DeliveryOrderModel(
      id: json['id'] as String,
      doNumber: json['doNumber'] as String? ?? '-',
      status: json['status'] as String? ?? '-',
      warung: DeliveryWarungModel.fromJson(warungJson),
      items: itemsJson
          .map((item) => DeliveryOrderItemModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      totalAmount: toDouble(json['totalAmount']),
      warehouseId: json['warehouseId'] as String?,
      kurirId: json['kurirId'] as String?,
      creditDays: int.tryParse(json['creditDays']?.toString() ?? ''),
      dueDate: parseDate(json['dueDate']),
      notes: json['notes'] as String?,
      photoProof: json['photoProof'] as String?,
      createdAt: parseDate(json['createdAt']),
    );
  }
}

class DeliveryWarungModel {
  DeliveryWarungModel({
    required this.id,
    required this.name,
    this.phone,
    this.address,
    this.latitude,
    this.longitude,
  });

  final String id;
  final String name;
  final String? phone;
  final String? address;
  final double? latitude;
  final double? longitude;

  factory DeliveryWarungModel.fromJson(Map<String, dynamic> json) {
    double? toDouble(dynamic value) {
      if (value == null) {
        return null;
      }
      return double.tryParse(value.toString());
    }

    return DeliveryWarungModel(
      id: json['id'] as String? ?? '-',
      name: json['name'] as String? ?? '-',
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      latitude: toDouble(json['latitude']),
      longitude: toDouble(json['longitude']),
    );
  }
}

class DeliveryOrderItemModel {
  DeliveryOrderItemModel({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
    required this.subtotal,
    this.unit,
  });

  final String productId;
  final String productName;
  final int quantity;
  final double price;
  final double subtotal;
  final String? unit;

  factory DeliveryOrderItemModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) => double.tryParse(value?.toString() ?? '0') ?? 0;

    final productJson = json['product'];
    final product = productJson is Map<String, dynamic> ? productJson : null;

    return DeliveryOrderItemModel(
      productId: json['productId'] as String? ?? product?['id'] as String? ?? '-',
      productName: product?['name'] as String? ?? json['productName'] as String? ?? '-',
      quantity: int.tryParse(json['quantity']?.toString() ?? '0') ?? 0,
      price: toDouble(json['price']),
      subtotal: toDouble(json['subtotal']),
      unit: product?['unit'] as String?,
    );
  }
}