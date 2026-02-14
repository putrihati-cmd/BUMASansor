import '../datasources/remote/stock_remote_datasource.dart';
import '../models/stock_model.dart';

class StockRepository {
  StockRepository(this._remoteDataSource);

  final StockRemoteDataSource _remoteDataSource;

  Future<List<StockModel>> fetchStocks(
      {String? warehouseId, String? productId, bool? lowStock}) {
    return _remoteDataSource.fetchStocks(
        warehouseId: warehouseId, productId: productId, lowStock: lowStock);
  }

  Future<List<StockModel>> fetchLowStockAlerts() {
    return _remoteDataSource.fetchLowStockAlerts();
  }

  Future<List<StockMovementModel>> fetchMovementHistory(
      {String? warehouseId, String? productId, String? movementType}) {
    return _remoteDataSource.fetchMovementHistory(
      warehouseId: warehouseId,
      productId: productId,
      movementType: movementType,
    );
  }

  Future<void> performOpname({
    required String warehouseId,
    required String productId,
    required int actualQty,
    required String reason,
  }) {
    return _remoteDataSource.performOpname(
      warehouseId: warehouseId,
      productId: productId,
      actualQty: actualQty,
      reason: reason,
    );
  }
}
