import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../data/models/cart_item_model.dart';
import '../../../data/models/sale_model.dart';
import '../../../data/models/sync_task_model.dart';
import '../../../data/datasources/local/hive_service.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/sales_provider.dart';
import '../../providers/sync_provider.dart';
import 'receipt_screen.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  PaymentMethod _paymentMethod = PaymentMethod.cash;
  final _cashReceivedController = TextEditingController();
  final _notesController = TextEditingController();

  double _discount = 0;

  @override
  void dispose() {
    _cashReceivedController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _processPayment() async {
    final cart = ref.read(cartProvider);
    if (cart.isEmpty) {
      return;
    }

    final auth = ref.read(authProvider);
    final warungId = auth.user?.warungId;
    if (warungId == null || warungId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Akun warung belum terhubung ke warungId.')),
      );
      return;
    }

    final subtotal = ref.read(cartSubtotalProvider);
    final total = (subtotal - _discount) < 0 ? 0.0 : (subtotal - _discount);

    double? cashReceived;
    double? cashChange;

    if (_paymentMethod == PaymentMethod.cash) {
      cashReceived = double.tryParse(_cashReceivedController.text) ?? 0;
      if (cashReceived < total) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Uang diterima kurang.')),
        );
        return;
      }
      cashChange = cashReceived - total;
    }

    final notes = _notesController.text.trim();
    final noteWithDiscount =
        _discount > 0 ? 'Discount: Rp ${_discount.toStringAsFixed(0)}' : null;
    final combinedNotes = [
      if (notes.isNotEmpty) notes,
      if (noteWithDiscount != null) noteWithDiscount,
    ].join(' | ');

    final isConnected = await ref.read(networkInfoProvider).isConnected;

    if (isConnected) {
      try {
        final salesRepo = ref.read(salesRepositoryProvider);
        final sale = await salesRepo.createSale(
          warungId: warungId,
          items: cart,
          paymentMethod: _paymentMethod,
          notes: combinedNotes.isEmpty ? null : combinedNotes,
        );

        ref.read(cartProvider.notifier).clear();

        if (!mounted) {
          return;
        }

        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => ReceiptScreen(
              sale: sale,
              cashReceived: cashReceived,
              cashChange: cashChange,
            ),
          ),
        );

        return;
      } on DioException {
        // Fall back to offline queue.
      } catch (_) {
        // Fall back to offline queue.
      }
    }

    // Offline: enqueue to sync queue.
    final cachedWarehouseId = HiveService.cacheBox.get('default_warehouse_id');
    if (cachedWarehouseId is! String || cachedWarehouseId.isEmpty) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                'Warehouse belum tersimpan untuk mode offline. Silakan online sekali untuk init.')),
      );
      return;
    }

    final taskId = DateTime.now().millisecondsSinceEpoch.toString();
    final payload = _buildSalePayload(
      warungId: warungId,
      warehouseId: cachedWarehouseId,
      items: cart,
      paymentMethod: _paymentMethod,
      notes: combinedNotes.isEmpty ? null : combinedNotes,
    );

    await ref.read(syncQueueProvider).enqueue(
          SyncTaskModel(
            id: taskId,
            endpoint: '/sales',
            method: 'POST',
            payload: payload,
            createdAt: DateTime.now(),
          ),
        );

    final offlineSale = _buildOfflineSale(
      id: taskId,
      warungId: warungId,
      items: cart,
      paymentMethod: _paymentMethod,
      total: total,
      createdAt: DateTime.now(),
    );

    ref.read(cartProvider.notifier).clear();

    if (!mounted) {
      return;
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => ReceiptScreen(
          sale: offlineSale,
          cashReceived: cashReceived,
          cashChange: cashChange,
        ),
      ),
    );
  }

  Map<String, dynamic> _buildSalePayload({
    required String warungId,
    required String warehouseId,
    required List<CartItemModel> items,
    required PaymentMethod paymentMethod,
    String? notes,
  }) {
    return {
      'warungId': warungId,
      'warehouseId': warehouseId,
      'paymentMethod': paymentMethodToApi(paymentMethod),
      'items': items
          .map(
            (item) => {
              'productId': item.product.id,
              'quantity': item.quantity,
              'price': item.product.sellPrice,
            },
          )
          .toList(),
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    };
  }

  SaleModel _buildOfflineSale({
    required String id,
    required String warungId,
    required List<CartItemModel> items,
    required PaymentMethod paymentMethod,
    required double total,
    required DateTime createdAt,
  }) {
    final datePart = DateFormat('yyyyMMdd-HHmmss').format(createdAt);

    return SaleModel(
      id: id,
      invoiceNumber: 'OFFLINE-$datePart',
      warungId: warungId,
      totalAmount: total,
      paidAmount: total,
      paymentMethod: paymentMethod,
      createdAt: createdAt,
      items: items
          .map(
            (item) => SaleItemModel(
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.sellPrice,
              subtotal: item.product.sellPrice * item.quantity,
            ),
          )
          .toList(),
      isOffline: true,
      offlineNote: 'Tersimpan di Sync Queue',
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    final total = (subtotal - _discount) < 0 ? 0.0 : (subtotal - _discount);

    final cashReceived = double.tryParse(_cashReceivedController.text) ?? 0;
    final cashChange = cashReceived - total;

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text('Item Belanja',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Card(
              child: Column(
                children: cart
                    .map(
                      (item) => ListTile(
                        title: Text(item.product.name,
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text(
                            '${item.quantity}x - Rp ${item.product.sellPrice.toStringAsFixed(0)}'),
                        trailing:
                            Text('Rp ${item.subtotal.toStringAsFixed(0)}'),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Diskon (Rp)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    TextField(
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(), hintText: '0'),
                      onChanged: (value) {
                        setState(() {
                          _discount = double.tryParse(value) ?? 0;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Metode Pembayaran',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    RadioGroup<PaymentMethod>(
                      groupValue: _paymentMethod,
                      onChanged: (value) {
                        if (value == null) {
                          return;
                        }
                        setState(() => _paymentMethod = value);
                      },
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          RadioListTile<PaymentMethod>(
                            value: PaymentMethod.cash,
                            title: Text('Cash'),
                          ),
                          RadioListTile<PaymentMethod>(
                            value: PaymentMethod.transfer,
                            title: Text('Transfer'),
                          ),
                          RadioListTile<PaymentMethod>(
                            value: PaymentMethod.qris,
                            title: Text('QRIS'),
                          ),
                          RadioListTile<PaymentMethod>(
                            value: PaymentMethod.edc,
                            title: Text('EDC/Kartu'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_paymentMethod == PaymentMethod.cash) ...[
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Uang Diterima',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _cashReceivedController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                            border: OutlineInputBorder(), hintText: '0'),
                        onChanged: (_) => setState(() {}),
                      ),
                      const SizedBox(height: 8),
                      Text(
                          'Kembalian: Rp ${cashChange.isNaN ? 0 : cashChange.toStringAsFixed(0)}'),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Catatan (opsional)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesController,
                      maxLines: 3,
                      decoration:
                          const InputDecoration(border: OutlineInputBorder()),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Subtotal'),
                        Text('Rp ${subtotal.toStringAsFixed(0)}'),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Diskon'),
                        Text('- Rp ${_discount.toStringAsFixed(0)}'),
                      ],
                    ),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TOTAL',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('Rp ${total.toStringAsFixed(0)}',
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _processPayment,
              icon: const Icon(Icons.check_circle),
              label: const Text('Proses Pembayaran'),
            ),
          ],
        ),
      ),
    );
  }
}
