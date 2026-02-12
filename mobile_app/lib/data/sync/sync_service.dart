import 'package:dio/dio.dart';

import '../../core/network/dio_client.dart';
import '../../core/network/network_info.dart';
import '../datasources/local/secure_storage_service.dart';
import 'sync_queue.dart';

class SyncService {
  SyncService(this._queue, SecureStorageService secureStorageService, this._networkInfo)
      : _dio = DioClient(secureStorageService).instance;

  final SyncQueue _queue;
  final NetworkInfo _networkInfo;
  final Dio _dio;

  Future<int> processQueue() async {
    if (!(await _networkInfo.isConnected)) {
      return 0;
    }

    final tasks = _queue.all();
    var success = 0;

    for (final task in tasks) {
      try {
        await _dio.request(
          task.endpoint,
          data: task.payload,
          options: Options(method: task.method),
        );
        await _queue.remove(task.id);
        success += 1;
      } catch (_) {
        // Stop processing to preserve order for dependent operations.
        break;
      }
    }

    return success;
  }
}
