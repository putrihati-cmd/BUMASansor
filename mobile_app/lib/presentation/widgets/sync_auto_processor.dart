import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/sync_provider.dart';

class SyncAutoProcessor extends ConsumerStatefulWidget {
  const SyncAutoProcessor({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<SyncAutoProcessor> createState() => _SyncAutoProcessorState();
}

class _SyncAutoProcessorState extends ConsumerState<SyncAutoProcessor> {
  StreamSubscription<List<ConnectivityResult>>? _sub;
  bool _running = false;

  @override
  void initState() {
    super.initState();

    // Auto-sync when connectivity becomes available.
    _sub = Connectivity().onConnectivityChanged.listen((results) async {
      final connected = !results.contains(ConnectivityResult.none);
      if (!connected) {
        return;
      }

      if (_running) {
        return;
      }

      _running = true;
      try {
        await ref.read(syncServiceProvider).processQueue();
      } finally {
        _running = false;
      }
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
