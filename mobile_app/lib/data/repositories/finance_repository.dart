import '../datasources/remote/finance_remote_datasource.dart';
import '../models/receivable_model.dart';

class FinanceRepository {
  FinanceRepository(this._remoteDataSource);

  final FinanceRemoteDataSource _remoteDataSource;

  Future<ReceivableListResponse> fetchReceivables({
    String? warungId,
    String? status,
    bool? overdueOnly,
    int page = 1,
    int limit = 50,
  }) {
    return _remoteDataSource.fetchReceivables(
      warungId: warungId,
      status: status,
      overdueOnly: overdueOnly,
      page: page,
      limit: limit,
    );
  }

  Future<void> createPayment({
    required String receivableId,
    required double amount,
    required String method,
    String? proofUrl,
    String? notes,
  }) async {
    await _remoteDataSource.createPayment({
      'receivableId': receivableId,
      'amount': amount,
      'method': method,
      if (proofUrl != null && proofUrl.trim().isNotEmpty) 'proofUrl': proofUrl.trim(),
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    });
  }
}
