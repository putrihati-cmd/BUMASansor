class CategoryModel {
  CategoryModel({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
}

class ProductModel {
  ProductModel({
    required this.id,
    required this.name,
    required this.barcode,
    required this.categoryId,
    required this.buyPrice,
    required this.sellPrice,
    required this.margin,
    required this.unit,
    this.description,
    this.imageUrl,
    this.isActive = true,
    this.category,
    this.currentStock,
  });

  final String id;
  final String name;
  final String barcode;
  final String categoryId;
  final double buyPrice;
  final double sellPrice;
  final double margin;
  final String unit;
  final String? description;
  final String? imageUrl;
  final bool isActive;
  final CategoryModel? category;

  // Optional for future stock UI.
  final int? currentStock;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final categoryJson = json['category'];
    final category = categoryJson is Map<String, dynamic> ? CategoryModel.fromJson(categoryJson) : null;

    final categoryId = (json['categoryId'] as String?) ?? category?.id ?? '';

    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String,
      barcode: json['barcode'] as String,
      categoryId: categoryId,
      buyPrice: double.parse(json['buyPrice'].toString()),
      sellPrice: double.parse(json['sellPrice'].toString()),
      margin: double.parse(json['margin'].toString()),
      unit: json['unit'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      isActive: (json['isActive'] as bool?) ?? true,
      category: category,
      currentStock: json['currentStock'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'barcode': barcode,
      'categoryId': categoryId,
      'buyPrice': buyPrice,
      'sellPrice': sellPrice,
      'margin': margin,
      'unit': unit,
      'description': description,
      'imageUrl': imageUrl,
      'isActive': isActive,
      'category': category?.toJson(),
      'currentStock': currentStock,
    };
  }
}
