import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      await ref.read(authProvider.notifier).bootstrap();
      if (!mounted) {
        return;
      }

      final state = ref.read(authProvider);
      if (!state.isLoggedIn) {
        context.go('/login');
        return;
      }

      switch (state.role) {
        case UserRole.admin:
          context.go('/admin');
          break;
        case UserRole.warung:
          context.go('/warung');
          break;
        case UserRole.kurir:
          context.go('/kurir');
          break;
        case UserRole.gudang:
          context.go('/gudang');
          break;
        case UserRole.unknown:
          context.go('/login');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
