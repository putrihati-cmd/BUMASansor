import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/product_remote_datasource.dart';
import '../../data/models/product_model.dart';
import '../../data/repositories/product_repository.dart';
import 'auth_provider.dart';

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = ProductRemoteDataSource(storage);
  return ProductRepository(remote);
});

final productListProvider = FutureProvider<List<ProductModel>>((ref) async {
  final repository = ref.read(productRepositoryProvider);
  return repository.fetchProducts();
});

final productSearchProvider =
    FutureProvider.family<List<ProductModel>, String?>((ref, search) async {
  final repository = ref.read(productRepositoryProvider);
  return repository.fetchProducts(search: search);
});

final productDetailProvider =
    FutureProvider.family<ProductModel, String>((ref, productId) async {
  final repository = ref.read(productRepositoryProvider);
  return repository.fetchById(productId);
});
