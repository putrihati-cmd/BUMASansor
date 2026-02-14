import '../datasources/remote/sales_remote_datasource.dart';
import '../models/cart_item_model.dart';
import '../models/sale_model.dart';
import 'warehouse_repository.dart';

class SalesRepository {
  SalesRepository(this._remoteDataSource, this._warehouseRepository);

  final SalesRemoteDataSource _remoteDataSource;
  final WarehouseRepository _warehouseRepository;

  Future<SaleModel> createSale({
    required String warungId,
    required List<CartItemModel> items,
    required PaymentMethod paymentMethod,
    String? notes,
  }) async {
    final warehouseId = await _warehouseRepository.getDefaultWarehouseId();

    final payload = {
      'warungId': warungId,
      'warehouseId': warehouseId,
      'paymentMethod': paymentMethodToApi(paymentMethod),
      'items': items
          .map(
            (item) => {
              'productId': item.product.id,
              'quantity': item.quantity,
              // Keep price explicit for consistency.
              'price': item.product.sellPrice,
            },
          )
          .toList(),
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    };

    return _remoteDataSource.createSale(payload);
  }

  Future<List<SaleModel>> listSales({
    required String warungId,
    String? dateFrom,
    String? dateTo,
    int page = 1,
    int limit = 50,
  }) {
    return _remoteDataSource.listSales(
      warungId: warungId,
      dateFrom: dateFrom,
      dateTo: dateTo,
      page: page,
      limit: limit,
    );
  }

  Future<SaleModel> getSale(String id) {
    return _remoteDataSource.getSale(id);
  }
}
