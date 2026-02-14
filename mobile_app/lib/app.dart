import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/config/theme_config.dart';
import 'presentation/router/app_router.dart';
import 'presentation/widgets/realtime_auto_connector.dart';
import 'presentation/widgets/sync_auto_processor.dart';

class BumasApp extends ConsumerWidget {
  const BumasApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return SyncAutoProcessor(
      child: RealtimeAutoConnector(
        child: MaterialApp.router(
          title: 'BUMAS Ansor',
          debugShowCheckedModeBanner: false,
          theme: ThemeConfig.lightTheme,
          routerConfig: router,
        ),
      ),
    );
  }
}
