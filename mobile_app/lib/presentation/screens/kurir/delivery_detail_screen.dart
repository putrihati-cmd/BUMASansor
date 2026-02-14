import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/models/delivery_order_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/delivery_provider.dart';
import '../../providers/upload_provider.dart';

class DeliveryDetailScreen extends ConsumerStatefulWidget {
  const DeliveryDetailScreen({super.key, required this.deliveryId});

  final String deliveryId;

  @override
  ConsumerState<DeliveryDetailScreen> createState() => _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends ConsumerState<DeliveryDetailScreen> {
  bool _saving = false;

  Uint8List? _photoBytes;
  final GlobalKey _signatureKey = GlobalKey();
  final List<Offset?> _signaturePoints = <Offset?>[];

  final _collectedController = TextEditingController(text: '0');

  @override
  void dispose() {
    _collectedController.dispose();
    super.dispose();
  }

  String _money(double value) => 'Rp ${value.toStringAsFixed(0)}';

  Future<void> _openMaps(DeliveryWarungModel warung) async {
    final lat = warung.latitude;
    final lng = warung.longitude;

    if (lat == null || lng == null) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Koordinat warung belum diisi.')));
      return;
    }

    final url = 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tidak bisa membuka Maps.')));
    }
  }

  Future<void> _pickPhoto() async {
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
      if (file == null) {
        return;
      }
      final bytes = await file.readAsBytes();
      if (!mounted) {
        return;
      }
      setState(() => _photoBytes = bytes);
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal ambil foto: $e')));
    }
  }

  void _clearSignature() {
    setState(() {
      _signaturePoints.clear();
    });
  }

  Future<Uint8List?> _captureSignaturePng() async {
    final boundary = _signatureKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    if (boundary == null) {
      return null;
    }

    final image = await boundary.toImage(pixelRatio: 3);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    return byteData?.buffer.asUint8List();
  }

  Future<void> _startDelivery() async {
    setState(() => _saving = true);
    try {
      final repo = ref.read(deliveryRepositoryProvider);
      await repo.startDelivery(widget.deliveryId);
      ref.invalidate(deliveryDetailProvider(widget.deliveryId));

      final userId = ref.read(authProvider).user?.id;
      ref.invalidate(deliveryListProvider(DeliveryQuery(kurirId: userId)));

      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Delivery dimulai.')));
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal start: $e')));
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Future<void> _markDelivered() async {
    setState(() => _saving = true);
    try {
      final repo = ref.read(deliveryRepositoryProvider);
      await repo.markDelivered(widget.deliveryId);
      ref.invalidate(deliveryDetailProvider(widget.deliveryId));

      final userId = ref.read(authProvider).user?.id;
      ref.invalidate(deliveryListProvider(DeliveryQuery(kurirId: userId)));

      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Status menjadi DELIVERED.')));
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal mark delivered: $e')));
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Future<void> _confirmDelivery(DeliveryOrderModel delivery) async {
    if (_signaturePoints.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tanda tangan masih kosong.')));
      return;
    }

    setState(() => _saving = true);

    try {
      // Give the signature canvas one frame before capturing.
      await Future<void>.delayed(const Duration(milliseconds: 16));

      final signaturePng = await _captureSignaturePng();
      final photo = _photoBytes;

      final collected = double.tryParse(_collectedController.text.trim()) ?? 0;

      if (signaturePng == null) {
        throw Exception('Gagal capture tanda tangan.');
      }

      final uploader = ref.read(uploadRepositoryProvider);

      String? photoUrl;
      if (photo != null) {
        final url = await uploader.uploadBytes(photo, filename: 'delivery_photo.jpg');
        if (url.trim().isNotEmpty) {
          photoUrl = url;
        }
      }

      final signatureUrl = await uploader.uploadBytes(signaturePng, filename: 'delivery_signature.png');
      if (signatureUrl.trim().isEmpty) {
        throw Exception('Upload tanda tangan gagal.');
      }

      final proof = jsonEncode({
        'photoUrl': photoUrl,
        'signatureUrl': signatureUrl,
        'collectedAmount': collected,
        'timestamp': DateTime.now().toIso8601String(),
      });

      final repo = ref.read(deliveryRepositoryProvider);
      await repo.confirmDelivery(delivery.id, photoProof: proof);

      ref.invalidate(deliveryDetailProvider(widget.deliveryId));

      final userId = ref.read(authProvider).user?.id;
      ref.invalidate(deliveryListProvider(DeliveryQuery(kurirId: userId)));

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Delivery dikonfirmasi.')));
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal confirm: $e')));
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final deliveryAsync = ref.watch(deliveryDetailProvider(widget.deliveryId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Delivery'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(deliveryDetailProvider(widget.deliveryId)),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: deliveryAsync.when(
        data: (delivery) {
          final warung = delivery.warung;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(delivery.doNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text('Status: ${delivery.status}'),
                      const SizedBox(height: 8),
                      Text('Warung: ${warung.name}', style: const TextStyle(fontWeight: FontWeight.bold)),
                      if (warung.address != null) Text('Alamat: ${warung.address}'),
                      if (warung.phone != null) Text('Telp: ${warung.phone}'),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          OutlinedButton.icon(
                            onPressed: _saving ? null : () => _openMaps(warung),
                            icon: const Icon(Icons.map),
                            label: const Text('Maps'),
                          ),
                          const SizedBox(width: 12),
                          Text('Total: ${_money(delivery.totalAmount)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text('Items', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Card(
                child: Column(
                  children: delivery.items
                      .map(
                        (i) => ListTile(
                          dense: true,
                          title: Text(i.productName, maxLines: 1, overflow: TextOverflow.ellipsis),
                          subtitle: Text('${i.quantity} ${i.unit ?? ''} x Rp ${i.price.toStringAsFixed(0)}'),
                          trailing: Text('Rp ${i.subtotal.toStringAsFixed(0)}'),
                        ),
                      )
                      .toList(),
                ),
              ),
              const SizedBox(height: 16),
              if (delivery.status == 'ASSIGNED')
                FilledButton.icon(
                  onPressed: _saving ? null : _startDelivery,
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Start Delivery'),
                ),
              if (delivery.status == 'ON_DELIVERY')
                FilledButton.icon(
                  onPressed: _saving ? null : _markDelivered,
                  icon: const Icon(Icons.flag),
                  label: const Text('Mark Delivered'),
                ),
              if (delivery.status == 'DELIVERED' || delivery.status == 'ON_DELIVERY') ...[
                const SizedBox(height: 16),
                const Divider(),
                const Text('Konfirmasi Delivery', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _saving ? null : _pickPhoto,
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Ambil Foto'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _collectedController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: 'Setoran (opsional)',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (_photoBytes != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.memory(_photoBytes!, height: 180, fit: BoxFit.cover),
                  ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Expanded(child: Text('Tanda tangan')),
                    TextButton(onPressed: _saving ? null : _clearSignature, child: const Text('Clear')),
                  ],
                ),
                RepaintBoundary(
                  key: _signatureKey,
                  child: Container(
                    height: 160,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade400),
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.white,
                    ),
                    child: GestureDetector(
                      onPanUpdate: (details) {
                        final renderBox = context.findRenderObject() as RenderBox?;
                        if (renderBox == null) {
                          return;
                        }
                        final local = renderBox.globalToLocal(details.globalPosition);
                        setState(() => _signaturePoints.add(local));
                      },
                      onPanEnd: (_) => setState(() => _signaturePoints.add(null)),
                      child: CustomPaint(
                        painter: _SignaturePainter(_signaturePoints),
                        size: Size.infinite,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: _saving ? null : () => _confirmDelivery(delivery),
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Confirm Delivery'),
                ),
              ],
              if (delivery.status == 'CONFIRMED')
                Card(
                  color: Colors.green.shade50,
                  child: const Padding(
                    padding: EdgeInsets.all(12),
                    child: Text('Delivery sudah CONFIRMED.'),
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal load detail: $e')),
      ),
    );
  }
}

class _SignaturePainter extends CustomPainter {
  _SignaturePainter(this.points);

  final List<Offset?> points;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 2;

    for (var i = 0; i < points.length - 1; i++) {
      final p1 = points[i];
      final p2 = points[i + 1];
      if (p1 != null && p2 != null) {
        canvas.drawLine(p1, p2, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SignaturePainter oldDelegate) {
    return oldDelegate.points != points;
  }
}
