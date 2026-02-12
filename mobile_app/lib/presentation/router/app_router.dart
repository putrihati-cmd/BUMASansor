import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/splash_screen.dart';
import '../screens/gudang/gudang_home_screen.dart';
import '../screens/kurir/kurir_home_screen.dart';
import '../screens/warung/warung_home_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/admin', builder: (context, state) => const AdminDashboardScreen()),
      GoRoute(path: '/warung', builder: (context, state) => const WarungHomeScreen()),
      GoRoute(path: '/kurir', builder: (context, state) => const KurirHomeScreen()),
      GoRoute(path: '/gudang', builder: (context, state) => const GudangHomeScreen()),
    ],
  );
});
