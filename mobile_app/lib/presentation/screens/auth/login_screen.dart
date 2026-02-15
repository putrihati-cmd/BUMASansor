import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController(text: 'admin@bumas.local');
  final _passwordController = TextEditingController(text: 'Admin12345');
  UserRole _selectedRole = UserRole.admin;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _redirectByRole(UserRole role) {
    switch (role) {
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
        break;
    }
  }

  Future<void> _loginApi() async {
    await ref.read(authProvider.notifier).login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );

    if (!mounted) {
      return;
    }

    final state = ref.read(authProvider);
    if (state.isLoggedIn) {
      _redirectByRole(state.role);
    }
  }

  Future<void> _mockLogin() async {
    await ref.read(authProvider.notifier).mockLogin(_selectedRole);
    if (!mounted) {
      return;
    }
    _redirectByRole(_selectedRole);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Login BUMAS')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: state.loading ? null : _loginApi,
                child: Text(state.loading ? 'Loading...' : 'Login API'),
              ),
              if (kDebugMode) ...[
                const SizedBox(height: 8),
                const Divider(),
                const SizedBox(height: 8),
                const Text('Fallback dev mode (mock role login):'),
                const SizedBox(height: 8),
                DropdownButtonFormField<UserRole>(
                  initialValue: _selectedRole,
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: const [
                    DropdownMenuItem(
                        value: UserRole.admin, child: Text('Admin')),
                    DropdownMenuItem(
                        value: UserRole.gudang, child: Text('Gudang')),
                    DropdownMenuItem(
                        value: UserRole.kurir, child: Text('Kurir')),
                    DropdownMenuItem(
                        value: UserRole.warung, child: Text('Warung')),
                  ],
                  onChanged: (value) {
                    if (value == null) {
                      return;
                    }
                    setState(() {
                      _selectedRole = value;
                    });
                  },
                ),
                const SizedBox(height: 8),
                OutlinedButton(
                    onPressed: _mockLogin, child: const Text('Masuk (Mock)')),
              ],
              if (state.errorMessage != null) ...[
                const SizedBox(height: 12),
                Text(
                  state.errorMessage!,
                  style: const TextStyle(color: Colors.red),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
