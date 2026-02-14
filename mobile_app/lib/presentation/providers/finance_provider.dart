import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/finance_remote_datasource.dart';
import '../../data/models/receivable_model.dart';
import '../../data/repositories/finance_repository.dart';
import 'auth_provider.dart';

class ReceivableQuery {
  const ReceivableQuery({
    this.warungId,
    this.status,
    this.overdueOnly,
    this.page = 1,
    this.limit = 50,
  });

  final String? warungId;
  final String? status;
  final bool? overdueOnly;
  final int page;
  final int limit;

  @override
  bool operator ==(Object other) {
    return other is ReceivableQuery &&
        other.warungId == warungId &&
        other.status == status &&
        other.overdueOnly == overdueOnly &&
        other.page == page &&
        other.limit == limit;
  }

  @override
  int get hashCode => Object.hash(warungId, status, overdueOnly, page, limit);
}

final financeRepositoryProvider = Provider<FinanceRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = FinanceRemoteDataSource(storage);
  return FinanceRepository(remote);
});

final receivableListProvider =
    FutureProvider.family<ReceivableListResponse, ReceivableQuery>(
        (ref, query) async {
  final repo = ref.read(financeRepositoryProvider);
  return repo.fetchReceivables(
    warungId: query.warungId,
    status: query.status,
    overdueOnly: query.overdueOnly,
    page: query.page,
    limit: query.limit,
  );
});
