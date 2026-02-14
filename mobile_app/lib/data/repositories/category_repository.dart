import '../datasources/remote/category_remote_datasource.dart';
import '../models/product_model.dart';

class CategoryRepository {
  CategoryRepository(this._remote);

  final CategoryRemoteDataSource _remote;

  Future<List<CategoryModel>> fetchCategories() {
    return _remote.fetchCategories();
  }
}