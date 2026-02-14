import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/warung_provider.dart';

class WarungManagementScreen extends ConsumerStatefulWidget {
  const WarungManagementScreen({super.key});

  @override
  ConsumerState<WarungManagementScreen> createState() => _WarungManagementScreenState();
}

class _WarungManagementScreenState extends ConsumerState<WarungManagementScreen> {
  final _searchController = TextEditingController();
  bool _blockedOnly = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  WarungQuery get _query {
    return WarungQuery(
      search: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
      blocked: _blockedOnly ? true : null,
      page: 1,
      limit: 200,
    );
  }

  Future<void> _toggleBlock(String warungId, bool isBlocked) async {
    final repo = ref.read(warungRepositoryProvider);

    if (isBlocked) {
      final ok = await showDialog<bool>(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Unblock warung'),
            content: const Text('Yakin ingin unblock warung ini?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
              FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Unblock')),
            ],
          );
        },
      );

      if (ok != true) {
        return;
      }

      await repo.unblockWarung(warungId);
    } else {
      final reasonController = TextEditingController();
      final ok = await showDialog<bool>(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Block warung'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Masukkan alasan block (opsional).'),
                const SizedBox(height: 12),
                TextField(
                  controller: reasonController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Contoh: Overdue payment > 3 hari',
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
              FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Block')),
            ],
          );
        },
      );

      final reason = reasonController.text.trim();
      reasonController.dispose();

      if (ok != true) {
        return;
      }

      await repo.blockWarung(warungId, reason: reason.isEmpty ? 'Blocked by admin' : reason);
    }

    if (!mounted) {
      return;
    }

    ref.invalidate(warungListProvider(_query));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(isBlocked ? 'Warung di-unblock.' : 'Warung di-block.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final warungsAsync = ref.watch(warungListProvider(_query));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manajemen Warung'),
        actions: [
          IconButton(
            tooltip: _blockedOnly ? 'Tampilkan semua' : 'Filter blocked',
            onPressed: () => setState(() => _blockedOnly = !_blockedOnly),
            icon: Icon(_blockedOnly ? Icons.filter_alt_off : Icons.filter_alt),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari nama / owner...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          setState(() {
                            _searchController.clear();
                          });
                        },
                        icon: const Icon(Icons.clear),
                      ),
                border: const OutlineInputBorder(),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: warungsAsync.when(
              data: (items) {
                if (items.isEmpty) {
                  return const Center(child: Text('Tidak ada warung.'));
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(warungListProvider(_query));
                    await Future<void>.delayed(const Duration(milliseconds: 200));
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final w = items[index];
                      return ListTile(
                        onTap: () => context.push('/admin/warungs/${w.id}'),
                        title: Text(w.name),
                        subtitle: Text(
                          '${w.ownerName} | Limit: Rp ${w.creditLimit.toStringAsFixed(0)} | Debt: Rp ${w.currentDebt.toStringAsFixed(0)}',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: OutlinedButton(
                          onPressed: () => _toggleBlock(w.id, w.isBlocked),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: w.isBlocked ? Colors.green : Colors.red,
                          ),
                          child: Text(w.isBlocked ? 'Unblock' : 'Block'),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Gagal load warung: $error'),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: () => ref.invalidate(warungListProvider(_query)),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/admin/warungs/new'),
        icon: const Icon(Icons.add),
        label: const Text('Tambah'),
      ),
    );
  }
}