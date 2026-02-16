import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import 'pos_screen.dart';
import 'restock_screen.dart';

enum WarungMode { pos, restock }

final warungModeProvider = StateProvider<WarungMode>((ref) => WarungMode.pos);

class WarungDashboardScreen extends ConsumerWidget {
  const WarungDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(warungModeProvider);
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(mode == WarungMode.pos ? 'BUMAS POS' : 'Kulakan BUMAS'),
        backgroundColor: mode == WarungMode.pos 
            ? Colors.green.shade700 
            : Colors.blue.shade700,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: auth.loading
                ? null
                : () async {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: mode == WarungMode.pos ? const POSScreen() : const RestockScreen(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: mode == WarungMode.pos ? 0 : 1,
        selectedItemColor: mode == WarungMode.pos ? Colors.green : Colors.blue,
        onTap: (index) {
          ref.read(warungModeProvider.notifier).state = 
              index == 0 ? WarungMode.pos : WarungMode.restock;
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.calculate),
            label: 'Kasir (POS)',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory),
            label: 'Kulakan (B2B)',
          ),
        ],
      ),
    );
  }
}
