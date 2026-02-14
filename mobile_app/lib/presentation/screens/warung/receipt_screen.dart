import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';

import '../../../data/models/sale_model.dart';
import '../../widgets/bluetooth_printer_sheet.dart';

class ReceiptScreen extends StatelessWidget {
  const ReceiptScreen({
    super.key,
    required this.sale,
    this.cashReceived,
    this.cashChange,
  });

  final SaleModel sale;
  final double? cashReceived;
  final double? cashChange;

  String _methodLabel(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.cash:
        return 'CASH';
      case PaymentMethod.transfer:
        return 'TRANSFER';
      case PaymentMethod.qris:
        return 'QRIS';
      case PaymentMethod.edc:
        return 'EDC';
    }
  }

  String _buildReceiptText() {
    final sb = StringBuffer();
    sb.writeln('BUMAS Ansor');
    sb.writeln('====================');
    sb.writeln('Invoice: ${sale.invoiceNumber}');
    sb.writeln(
        'Tanggal: ${DateFormat('yyyy-MM-dd HH:mm').format(sale.createdAt)}');
    sb.writeln('Metode: ${_methodLabel(sale.paymentMethod)}');
    sb.writeln('--------------------');

    for (final item in sale.items) {
      sb.writeln(item.productName);
      sb.writeln(
          '  ${item.quantity} x ${item.price.toStringAsFixed(0)} = ${item.subtotal.toStringAsFixed(0)}');
    }

    sb.writeln('--------------------');
    sb.writeln('TOTAL: ${sale.totalAmount.toStringAsFixed(0)}');

    if (cashReceived != null) {
      sb.writeln('TUNAI: ${cashReceived!.toStringAsFixed(0)}');
    }
    if (cashChange != null) {
      sb.writeln('KEMBALI: ${cashChange!.toStringAsFixed(0)}');
    }

    if (sale.isOffline) {
      sb.writeln('--------------------');
      sb.writeln('OFFLINE: ${sale.offlineNote ?? '-'}');
    }

    return sb.toString();
  }

  List<int> _buildReceiptBytes(String text) {
    // Minimal ESC/POS compatible payload.
    // Most thermal printers accept plain text + new lines. Cut command is optional.
    final bytes = <int>[];
    bytes.addAll(utf8.encode(text));
    bytes.addAll(const [0x0A, 0x0A, 0x0A]);
    // ESC/POS cut (some printers ignore this).
    bytes.addAll(const [0x1D, 0x56, 0x00]);
    return bytes;
  }

  @override
  Widget build(BuildContext context) {
    final text = _buildReceiptText();
    final bytes = _buildReceiptBytes(text);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Struk'),
        actions: [
          IconButton(
            tooltip: 'Copy',
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: text));
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Struk disalin.')),
                );
              }
            },
            icon: const Icon(Icons.copy),
          ),
          IconButton(
            tooltip: 'Share',
            onPressed: () async {
              await SharePlus.instance.share(
                ShareParams(
                  text: text,
                  subject: 'Struk ${sale.invoiceNumber}',
                ),
              );
            },
            icon: const Icon(Icons.share),
          ),
          IconButton(
            tooltip: 'Print',
            onPressed: () async {
              await showModalBottomSheet<void>(
                context: context,
                isScrollControlled: true,
                builder: (_) => BluetoothPrinterSheet(
                  bytes: bytes,
                  title: 'Print Struk',
                ),
              );
            },
            icon: const Icon(Icons.print),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            if (sale.isOffline)
              Card(
                color: Colors.orange.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text('OFFLINE: ${sale.offlineNote ?? 'Tersimpan'}'),
                ),
              ),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Center(
                      child: Text('BUMAS Ansor',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 12),
                    Text('Invoice: ${sale.invoiceNumber}'),
                    Text(
                        'Tanggal: ${DateFormat('yyyy-MM-dd HH:mm').format(sale.createdAt)}'),
                    Text('Metode: ${_methodLabel(sale.paymentMethod)}'),
                    const Divider(),
                    ...sale.items.map(
                      (item) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(item.productName,
                                  maxLines: 1, overflow: TextOverflow.ellipsis),
                            ),
                            Text('${item.quantity}x'),
                            const SizedBox(width: 12),
                            Text('Rp ${item.subtotal.toStringAsFixed(0)}'),
                          ],
                        ),
                      ),
                    ),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TOTAL',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('Rp ${sale.totalAmount.toStringAsFixed(0)}',
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    if (cashReceived != null) ...[
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('TUNAI'),
                          Text('Rp ${cashReceived!.toStringAsFixed(0)}'),
                        ],
                      ),
                    ],
                    if (cashChange != null) ...[
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('KEMBALIAN'),
                          Text('Rp ${cashChange!.toStringAsFixed(0)}'),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              child: const Text('Kembali ke POS'),
            ),
          ],
        ),
      ),
    );
  }
}
