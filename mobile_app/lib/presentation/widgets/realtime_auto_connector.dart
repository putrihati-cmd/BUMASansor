import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/api_config.dart';
import '../../core/network/realtime_socket.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../providers/delivery_provider.dart';
import '../providers/finance_provider.dart';
import '../providers/purchase_order_provider.dart';
import '../providers/stock_provider.dart';

class RealtimeAutoConnector extends ConsumerStatefulWidget {
  const RealtimeAutoConnector({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<RealtimeAutoConnector> createState() =>
      _RealtimeAutoConnectorState();
}

class _RealtimeAutoConnectorState extends ConsumerState<RealtimeAutoConnector> {
  RealtimeSocket? _socket;
  bool _connecting = false;
  ProviderSubscription<AuthState>? _authSub;

  @override
  void initState() {
    super.initState();

    // React to login/logout.
    _authSub = ref.listenManual<AuthState>(authProvider, (prev, next) {
      final prevLoggedIn = prev?.isLoggedIn ?? false;
      final nextLoggedIn = next.isLoggedIn;

      if (!prevLoggedIn && nextLoggedIn) {
        unawaited(_connect());
        return;
      }

      if (prevLoggedIn && !nextLoggedIn) {
        _disconnect();
      }
    });
  }

  @override
  void dispose() {
    _disconnect();
    _authSub?.close();
    super.dispose();
  }

  Future<void> _connect() async {
    if (_socket != null || _connecting) {
      return;
    }

    _connecting = true;
    try {
      final storage = ref.read(secureStorageProvider);
      final token = await storage.getAccessToken();
      if (token == null || token.trim().isEmpty) {
        return;
      }

      final socket =
          RealtimeSocket(apiBaseUrl: ApiConfig.baseUrl, token: token);

      // Register listeners before connecting to avoid races.
      socket.on('stocks.updated', (_) {
        ref.invalidate(stockListProvider);
        ref.invalidate(lowStockAlertsProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.on('po.created', (_) {
        ref.invalidate(purchaseOrderListProvider);
        ref.invalidate(approvedPurchaseOrdersProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.on('po.updated', (_) {
        ref.invalidate(purchaseOrderListProvider);
        ref.invalidate(approvedPurchaseOrdersProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.on('do.created', (_) {
        ref.invalidate(deliveryListProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.on('do.updated', (_) {
        ref.invalidate(deliveryListProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.on('sales.created', (_) {
        ref.invalidate(dashboardProvider);
      });

      socket.on('receivable.created', (_) {
        ref.invalidate(receivableListProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.on('receivable.updated', (_) {
        ref.invalidate(receivableListProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.on('finance.overdueRefreshed', (_) {
        ref.invalidate(receivableListProvider);
        ref.invalidate(dashboardProvider);
      });

      socket.connect();
      _socket = socket;
    } finally {
      _connecting = false;
    }
  }

  void _disconnect() {
    final socket = _socket;
    _socket = null;

    if (socket == null) {
      return;
    }

    try {
      socket.disconnect();
    } catch (_) {}

    try {
      socket.dispose();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    // If user is already logged in after bootstrap, connect once.
    final auth = ref.watch(authProvider);
    if (auth.isLoggedIn) {
      unawaited(_connect());
    }

    return widget.child;
  }
}
