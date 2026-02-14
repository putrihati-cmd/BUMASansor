import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/category_remote_datasource.dart';
import '../../data/models/product_model.dart';
import '../../data/repositories/category_repository.dart';
import 'auth_provider.dart';

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = CategoryRemoteDataSource(storage);
  return CategoryRepository(remote);
});

final categoryListProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final repo = ref.read(categoryRepositoryProvider);
  return repo.fetchCategories();
});