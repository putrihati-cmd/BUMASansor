import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  static const String authBoxName = 'auth_box';
  static const String syncQueueBoxName = 'sync_queue_box';
  static const String cacheBoxName = 'cache_box';

  static Future<void> init() async {
    await Hive.openBox(authBoxName);
    await Hive.openBox(syncQueueBoxName);
    await Hive.openBox(cacheBoxName);
  }

  static Box<dynamic> get authBox => Hive.box(authBoxName);
  static Box<dynamic> get syncQueueBox => Hive.box(syncQueueBoxName);
  static Box<dynamic> get cacheBox => Hive.box(cacheBoxName);
}
