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
    required this.basePrice,
    this.suggestedPrice,
    required this.unit,
    this.description,
    this.imageUrl,
    this.isActive = true,
    this.category,
  });

  final String id;
  final String name;
  final String barcode;
  final String categoryId;
  final double basePrice;
  final double? suggestedPrice;
  final String unit;
  final String? description;
  final String? imageUrl;
  final bool isActive;
  final CategoryModel? category;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final categoryJson = json['category'];
    final category = categoryJson is Map<String, dynamic>
        ? CategoryModel.fromJson(categoryJson)
        : null;

    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String,
      barcode: json['barcode'] as String,
      categoryId: (json['categoryId'] as String?) ?? '',
      basePrice: double.parse(json['basePrice']?.toString() ?? '0'),
      suggestedPrice: json['suggestedPrice'] != null 
          ? double.parse(json['suggestedPrice'].toString()) 
          : null,
      unit: json['unit'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      isActive: (json['isActive'] as bool?) ?? true,
      category: category,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'barcode': barcode,
      'categoryId': categoryId,
      'basePrice': basePrice,
      'suggestedPrice': suggestedPrice,
      'unit': unit,
      'description': description,
      'imageUrl': imageUrl,
      'isActive': isActive,
      'category': category?.toJson(),
    };
  }
}

class WarungProductModel {
  WarungProductModel({
    required this.id,
    required this.warungId,
    required this.productId,
    required this.sellingPrice,
    required this.stockQty,
    this.minStock = 5,
    this.product,
  });

  final String id;
  final String warungId;
  final String productId;
  final double sellingPrice;
  final int stockQty;
  final int minStock;
  final ProductModel? product;

  factory WarungProductModel.fromJson(Map<String, dynamic> json) {
    return WarungProductModel(
      id: json['id'] as String,
      warungId: json['warungId'] as String,
      productId: json['productId'] as String,
      sellingPrice: double.parse(json['sellingPrice'].toString()),
      stockQty: json['stockQty'] as int,
      minStock: (json['minStock'] as int?) ?? 5,
      product: json['product'] != null 
          ? ProductModel.fromJson(json['product']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'warungId': warungId,
      'productId': productId,
      'sellingPrice': sellingPrice,
      'stockQty': stockQty,
      'minStock': minStock,
      'product': product?.toJson(),
    };
  }
}
