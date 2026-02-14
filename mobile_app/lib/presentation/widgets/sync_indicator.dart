import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../data/datasources/local/hive_service.dart';

class SyncIndicator extends StatelessWidget {
  const SyncIndicator({super.key, this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: HiveService.syncQueueBox.listenable(),
      builder: (context, box, _) {
        final count = box.length;
        final child = IconButton(
          tooltip: count > 0 ? 'Sync queue: $count' : 'Sync',
          onPressed: onTap,
          icon: const Icon(Icons.sync),
        );

        if (count <= 0) {
          return child;
        }

        return Badge(
          label: Text(count.toString()),
          child: child,
        );
      },
    );
  }
}
