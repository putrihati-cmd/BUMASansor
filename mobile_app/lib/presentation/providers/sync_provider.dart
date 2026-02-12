import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_info.dart';
import '../../data/sync/sync_queue.dart';
import '../../data/sync/sync_service.dart';
import 'auth_provider.dart';

final syncQueueProvider = Provider<SyncQueue>((ref) {
  return SyncQueue();
});

final networkInfoProvider = Provider<NetworkInfo>((ref) {
  return NetworkInfo(Connectivity());
});

final syncServiceProvider = Provider<SyncService>((ref) {
  final queue = ref.read(syncQueueProvider);
  final storage = ref.read(secureStorageProvider);
  final network = ref.read(networkInfoProvider);
  return SyncService(queue, storage, network);
});

final processSyncQueueProvider = FutureProvider<int>((ref) async {
  final syncService = ref.read(syncServiceProvider);
  return syncService.processQueue();
});
