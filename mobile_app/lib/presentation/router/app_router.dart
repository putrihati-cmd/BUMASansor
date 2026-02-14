import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/admin/create_do_screen.dart';
import '../screens/admin/product_form_screen.dart';
import '../screens/admin/product_management_screen.dart';
import '../screens/admin/reports_screen.dart';
import '../screens/admin/verify_payments_screen.dart';
import '../screens/admin/warung_form_screen.dart';
import '../screens/admin/warung_management_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/splash_screen.dart';
import '../screens/gudang/prepare_delivery_screen.dart';
import '../screens/gudang/receive_goods_screen.dart';
import '../screens/gudang/stock_opname_screen.dart';
import '../screens/gudang/stock_overview_screen.dart';
import '../screens/kurir/delivery_detail_screen.dart';
import '../screens/kurir/delivery_list_screen.dart';
import '../screens/warung/pos_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
        routes: [
          GoRoute(
            path: 'warungs',
            builder: (context, state) => const WarungManagementScreen(),
            routes: [
              GoRoute(path: 'new', builder: (context, state) => const WarungFormScreen()),
              GoRoute(
                path: ':id',
                builder: (context, state) => WarungFormScreen(warungId: state.pathParameters['id']),
              ),
            ],
          ),
          GoRoute(
            path: 'products',
            builder: (context, state) => const ProductManagementScreen(),
            routes: [
              GoRoute(path: 'new', builder: (context, state) => const ProductFormScreen()),
              GoRoute(
                path: ':id',
                builder: (context, state) => ProductFormScreen(productId: state.pathParameters['id']),
              ),
            ],
          ),
          GoRoute(path: 'create-do', builder: (context, state) => const CreateDOScreen()),
          GoRoute(path: 'verify-payments', builder: (context, state) => const VerifyPaymentsScreen()),
          GoRoute(path: 'reports', builder: (context, state) => const ReportsScreen()),
        ],
      ),
      GoRoute(path: '/warung', builder: (context, state) => const POSScreen()),
      GoRoute(
        path: '/kurir',
        builder: (context, state) => const DeliveryListScreen(),
        routes: [
          GoRoute(
            path: 'deliveries/:id',
            builder: (context, state) => DeliveryDetailScreen(deliveryId: state.pathParameters['id'] ?? ''),
          ),
        ],
      ),
      GoRoute(
        path: '/gudang',
        builder: (context, state) => const StockOverviewScreen(),
        routes: [
          GoRoute(path: 'receive-goods', builder: (context, state) => const ReceiveGoodsScreen()),
          GoRoute(path: 'prepare-delivery', builder: (context, state) => const PrepareDeliveryScreen()),
          GoRoute(
            path: 'opname',
            builder: (context, state) => StockOpnameScreen(
              initialWarehouseId: state.uri.queryParameters['warehouseId'],
              initialProductId: state.uri.queryParameters['productId'],
            ),
          ),
        ],
      ),
    ],
  );
});
