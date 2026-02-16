import '../datasources/local/hive_service.dart';
import '../datasources/remote/product_remote_datasource.dart';
import '../models/product_model.dart';

class ProductRepository {
  ProductRepository(this._remoteDataSource);

  final ProductRemoteDataSource _remoteDataSource;

  static const String _cachedAllProductsKey = 'cached_products_all_v1';

  List<ProductModel>? _readCachedAll() {
    final raw = HiveService.cacheBox.get(_cachedAllProductsKey);
    if (raw is! List) {
      return null;
    }

    try {
      return raw
          .whereType<Map>()
          .map((m) => ProductModel.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    } catch (_) {
      return null;
    }
  }

  Future<void> _writeCachedAll(List<ProductModel> items) async {
    await HiveService.cacheBox.put(
      _cachedAllProductsKey,
      items.map((p) => p.toJson()).toList(),
    );
  }

  Future<List<ProductModel>> fetchProducts({String? search}) async {
    try {
      final items = await _remoteDataSource.fetchProducts(search: search);

      // Cache full list only (pragmatic). Search results fall back to this cache.
      final isFull = search == null || search.trim().isEmpty;
      if (isFull) {
        await _writeCachedAll(items);
      }

      return items;
    } catch (e) {
      final cached = _readCachedAll();
      if (cached == null) {
        rethrow;
      }

      final q = search?.trim().toLowerCase();
      if (q == null || q.isEmpty) {
        return cached;
      }

      return cached
          .where(
            (p) =>
                p.name.toLowerCase().contains(q) ||
                p.barcode.toLowerCase().contains(q),
          )
          .toList();
    }
  }

  Future<ProductModel> fetchByBarcode(String barcode) async {
    try {
      return await _remoteDataSource.fetchByBarcode(barcode);
    } catch (e) {
      final cached = _readCachedAll();
      if (cached != null) {
        final hit = cached.where((p) => p.barcode == barcode).toList();
        if (hit.isNotEmpty) {
          return hit.first;
        }
      }
      rethrow;
    }
  }

  Future<ProductModel> fetchById(String id) async {
    try {
      return await _remoteDataSource.fetchById(id);
    } catch (e) {
      final cached = _readCachedAll();
      if (cached != null) {
        final hit = cached.where((p) => p.id == id).toList();
        if (hit.isNotEmpty) {
          return hit.first;
        }
      }
      rethrow;
    }
  }

  Future<ProductModel> createProduct({
    required String name,
    String? barcode,
    required String categoryId,
    required double buyPrice,
    required double sellPrice,
    required String unit,
    String? description,
    String? imageUrl,
    bool? isActive,
  }) {
    return _remoteDataSource.createProduct({
      'name': name,
      if (barcode != null && barcode.trim().isNotEmpty)
        'barcode': barcode.trim(),
      'categoryId': categoryId,
      'basePrice': buyPrice,
      if (sellPrice > 0) 'suggestedPrice': sellPrice,
      'unit': unit,
      if (description != null && description.trim().isNotEmpty)
        'description': description.trim(),
      if (imageUrl != null && imageUrl.trim().isNotEmpty)
        'imageUrl': imageUrl.trim(),
      if (isActive != null) 'isActive': isActive,
    });
  }

  Future<ProductModel> updateProduct({
    required String id,
    String? name,
    String? barcode,
    String? categoryId,
    double? buyPrice,
    double? sellPrice,
    String? unit,
    String? description,
    String? imageUrl,
    bool? isActive,
  }) {
    final payload = <String, dynamic>{};

    if (name != null) payload['name'] = name;
    if (barcode != null) payload['barcode'] = barcode;
    if (categoryId != null) payload['categoryId'] = categoryId;
    if (buyPrice != null) payload['basePrice'] = buyPrice;
    if (sellPrice != null) payload['suggestedPrice'] = sellPrice;
    if (unit != null) payload['unit'] = unit;
    if (description != null) payload['description'] = description;
    if (imageUrl != null) payload['imageUrl'] = imageUrl;
    if (isActive != null) payload['isActive'] = isActive;

    return _remoteDataSource.updateProduct(id, payload);
  }

  Future<void> deleteProduct(String id) {
    return _remoteDataSource.deleteProduct(id);
  }
}
