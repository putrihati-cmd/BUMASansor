class ProductModel {
  ProductModel({
    required this.id,
    required this.name,
    required this.barcode,
    required this.sellPrice,
    required this.unit,
  });

  final String id;
  final String name;
  final String barcode;
  final double sellPrice;
  final String unit;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String,
      barcode: json['barcode'] as String,
      sellPrice: double.parse(json['sellPrice'].toString()),
      unit: json['unit'] as String,
    );
  }
}
