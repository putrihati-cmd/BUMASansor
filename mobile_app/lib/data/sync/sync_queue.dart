import 'package:hive_flutter/hive_flutter.dart';

import '../datasources/local/hive_service.dart';
import '../models/sync_task_model.dart';

class SyncQueue {
  Box<dynamic> get _box => HiveService.syncQueueBox;

  Future<void> enqueue(SyncTaskModel task) async {
    await _box.put(task.id, task.toJson());
  }

  List<SyncTaskModel> all() {
    return _box.values
        .map((value) => SyncTaskModel.fromJson(value as Map<dynamic, dynamic>))
        .toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  Future<void> update(SyncTaskModel task) async {
    await _box.put(task.id, task.toJson());
  }

  Future<void> remove(String id) async {
    await _box.delete(id);
  }

  Future<void> clear() async {
    await _box.clear();
  }
}