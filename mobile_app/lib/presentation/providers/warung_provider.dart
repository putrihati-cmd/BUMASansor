import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/remote/warung_remote_datasource.dart';
import '../../data/models/warung_model.dart';
import '../../data/repositories/warung_repository.dart';
import 'auth_provider.dart';

class WarungQuery {
  const WarungQuery({
    this.search,
    this.blocked,
    this.page = 1,
    this.limit = 100,
  });

  final String? search;
  final bool? blocked;
  final int page;
  final int limit;

  @override
  bool operator ==(Object other) {
    return other is WarungQuery &&
        other.search == search &&
        other.blocked == blocked &&
        other.page == page &&
        other.limit == limit;
  }

  @override
  int get hashCode => Object.hash(search, blocked, page, limit);
}

final warungRepositoryProvider = Provider<WarungRepository>((ref) {
  final storage = ref.read(secureStorageProvider);
  final remote = WarungRemoteDataSource(storage);
  return WarungRepository(remote);
});

final warungListProvider = FutureProvider.family<List<WarungModel>, WarungQuery>((ref, query) async {
  final repository = ref.read(warungRepositoryProvider);
  return repository.fetchWarungs(
    search: query.search,
    blocked: query.blocked,
    page: query.page,
    limit: query.limit,
  );
});

final warungDetailProvider = FutureProvider.family<WarungModel, String>((ref, warungId) async {
  final repository = ref.read(warungRepositoryProvider);
  return repository.fetchWarungById(warungId);
});