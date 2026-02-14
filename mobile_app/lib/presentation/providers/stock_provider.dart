import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/stock_remote_datasource.dart';
import '../../data/models/stock_model.dart';
import '../../data/repositories/stock_repository.dart';
import 'auth_provider.dart';

class StockQuery {
  const StockQuery({this.warehouseId, this.productId, this.lowStock});

  final String? warehouseId;
  final String? productId;
  final bool? lowStock;

  @override
  bool operator ==(Object other) {
    return other is StockQuery &&
        other.warehouseId == warehouseId &&
        other.productId == productId &&
        other.lowStock == lowStock;
  }

  @override
  int get hashCode => Object.hash(warehouseId, productId, lowStock);
}

class StockHistoryQuery {
  const StockHistoryQuery({this.warehouseId, this.productId, this.movementType});

  final String? warehouseId;
  final String? productId;
  final String? movementType;

  @override
  bool operator ==(Object other) {
    return other is StockHistoryQuery &&
        other.warehouseId == warehouseId &&
        other.productId == productId &&
        other.movementType == movementType;
  }

  @override
  int get hashCode => Object.hash(warehouseId, productId, movementType);
}

final stockRepositoryProvider = Provider<StockRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = StockRemoteDataSource(storage);
  return StockRepository(remote);
});

final stockListProvider = FutureProvider.family<List<StockModel>, StockQuery>((ref, query) async {
  final repo = ref.read(stockRepositoryProvider);
  return repo.fetchStocks(
    warehouseId: query.warehouseId,
    productId: query.productId,
    lowStock: query.lowStock,
  );
});

final lowStockAlertsProvider = FutureProvider<List<StockModel>>((ref) async {
  final repo = ref.read(stockRepositoryProvider);
  return repo.fetchLowStockAlerts();
});

final stockMovementHistoryProvider = FutureProvider.family<List<StockMovementModel>, StockHistoryQuery>((ref, query) async {
  final repo = ref.read(stockRepositoryProvider);
  return repo.fetchMovementHistory(
    warehouseId: query.warehouseId,
    productId: query.productId,
    movementType: query.movementType,
  );
});
