import '../datasources/remote/product_remote_datasource.dart';
import '../models/product_model.dart';

class ProductRepository {
  ProductRepository(this._remoteDataSource);

  final ProductRemoteDataSource _remoteDataSource;

  Future<List<ProductModel>> fetchProducts({String? search}) {
    return _remoteDataSource.fetchProducts(search: search);
  }
}
