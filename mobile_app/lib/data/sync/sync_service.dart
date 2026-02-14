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

  static const int _maxRetries = 5;

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
      } on DioException catch (e) {
        final status = e.response?.statusCode;

        // Conflict resolution: server already has/accepted similar operation.
        if (status == 409) {
          await _queue.remove(task.id);
          continue;
        }

        final nextRetry = task.retryCount + 1;
        final msg = _dioErrorMessage(e);

        final updated = task.copyWith(
          retryCount: nextRetry,
          error: msg,
        );
        await _queue.update(updated);

        // Stop processing to preserve order for dependent operations.
        // If retries exceeded, keep the task for manual inspection.
        if (nextRetry >= _maxRetries) {
          break;
        }

        break;
      } catch (e) {
        final nextRetry = task.retryCount + 1;
        final updated = task.copyWith(
          retryCount: nextRetry,
          error: e.toString(),
        );
        await _queue.update(updated);
        break;
      }
    }

    return success;
  }

  String _dioErrorMessage(DioException e) {
    final status = e.response?.statusCode;
    final data = e.response?.data;

    final msg = <String>[
      if (status != null) 'HTTP $status',
      if (data is Map && data['message'] != null) data['message'].toString(),
      e.message ?? 'Request failed',
    ].where((s) => s.trim().isNotEmpty).join(' | ');

    return msg;
  }
}
