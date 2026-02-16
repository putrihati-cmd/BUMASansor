import 'product_model.dart';

enum PaymentMethod {
  cash,
  transfer,
  qris,
  edc,
}

PaymentMethod paymentMethodFromApi(String value) {
  switch (value.toUpperCase()) {
    case 'CASH':
      return PaymentMethod.cash;
    case 'TRANSFER':
      return PaymentMethod.transfer;
    case 'QRIS':
      return PaymentMethod.qris;
    case 'EDC':
      return PaymentMethod.edc;
    default:
      return PaymentMethod.transfer;
  }
}

String paymentMethodToApi(PaymentMethod method) {
  switch (method) {
    case PaymentMethod.cash:
      return 'CASH';
    case PaymentMethod.transfer:
      return 'TRANSFER';
    case PaymentMethod.qris:
      return 'QRIS';
    case PaymentMethod.edc:
      return 'EDC';
  }
}

class SaleItemModel {
  SaleItemModel({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
    required this.subtotal,
  });

  final String productId;
  final String productName;
  final int quantity;
  final double price;
  final double subtotal;

  factory SaleItemModel.fromJson(Map<String, dynamic> json) {
    // Check if 'warungProduct' exists (from backend) or 'product' (older/offline)
    final warungProduct = json['warungProduct'];
    final productJson = warungProduct != null ? warungProduct['product'] : json['product'];
    
    final product = productJson is Map<String, dynamic>
        ? ProductModel.fromJson(productJson)
        : null;

    final priceVal = json['unitPrice'] ?? json['price']; // API uses unitPrice, local uses price

    return SaleItemModel(
      productId: (json['productId'] as String?) ?? (warungProduct?['productId'] as String?) ?? '', 
      productName: product?.name ?? (json['productName'] as String? ?? '-'),
      quantity: json['quantity'] as int,
      price: double.parse(priceVal.toString()),
      subtotal: double.parse(json['subtotal'].toString()),
    );
  }
}

class SaleModel {
  SaleModel({
    required this.id,
    required this.invoiceNumber,
    required this.warungId,
    required this.totalAmount,
    required this.paidAmount,
    required this.paymentMethod,
    required this.createdAt,
    required this.items,
    this.isOffline = false,
    this.offlineNote,
  });

  final String id;
  final String invoiceNumber;
  final String warungId;
  final double totalAmount;
  final double paidAmount;
  final PaymentMethod paymentMethod;
  final DateTime createdAt;
  final List<SaleItemModel> items;

  final bool isOffline;
  final String? offlineNote;

  factory SaleModel.fromJson(Map<String, dynamic> json) {
    final itemsJson = json['items'];
    final items = itemsJson is List
        ? itemsJson
            .whereType<Map<String, dynamic>>()
            .map((item) => SaleItemModel.fromJson(item))
            .toList()
        : <SaleItemModel>[];

    return SaleModel(
      id: json['id'] as String,
      invoiceNumber: json['invoiceNumber'] as String,
      warungId: json['warungId'] as String,
      totalAmount: double.parse(json['totalAmount'].toString()),
      paidAmount: double.parse(json['paidAmount'].toString()),
      paymentMethod: paymentMethodFromApi(json['paymentMethod'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      items: items,
    );
  }
}
