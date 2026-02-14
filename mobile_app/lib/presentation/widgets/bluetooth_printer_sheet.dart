import 'dart:io';

import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';

import '../../data/datasources/local/hive_service.dart';

class BluetoothPrinterSheet extends StatefulWidget {
  const BluetoothPrinterSheet({
    super.key,
    required this.bytes,
    this.title,
  });

  final List<int> bytes;
  final String? title;

  @override
  State<BluetoothPrinterSheet> createState() => _BluetoothPrinterSheetState();
}

class _BluetoothPrinterSheetState extends State<BluetoothPrinterSheet> {
  static const _keyDefaultPrinterMac = 'printer.default.mac';
  static const _keyDefaultPrinterName = 'printer.default.name';

  bool _loading = true;
  bool _printing = false;
  String? _error;
  List<BluetoothInfo> _devices = const [];
  String? _defaultMac;

  @override
  void initState() {
    super.initState();
    _defaultMac = HiveService.cacheBox.get(_keyDefaultPrinterMac) as String?;
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final enabled = await PrintBluetoothThermal.bluetoothEnabled;
      if (!enabled) {
        setState(() {
          _devices = const [];
          _error = 'Bluetooth belum aktif. Nyalakan Bluetooth dulu.';
        });
        return;
      }

      final permissionOk = await _ensureBluetoothPermission();
      if (!permissionOk) {
        setState(() {
          _devices = const [];
          _error = 'Izin Bluetooth ditolak. Silakan izinkan "Nearby devices".';
        });
        return;
      }

      final devices = await PrintBluetoothThermal.pairedBluetooths;
      setState(() {
        _devices = devices;
      });
    } catch (e) {
      setState(() {
        _devices = const [];
        _error = 'Gagal membaca perangkat Bluetooth: $e';
      });
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<bool> _ensureBluetoothPermission() async {
    if (!Platform.isAndroid) {
      return true;
    }

    // Plugin helper: returns true on Android < 12, and checks runtime permission on 12+.
    final granted = await PrintBluetoothThermal.isPermissionBluetoothGranted;
    if (granted) {
      return true;
    }

    final statuses = await <Permission>[
      Permission.bluetoothConnect,
      Permission.bluetoothScan,
    ].request();

    final allGranted = statuses.values.every((status) => status.isGranted);
    if (allGranted) {
      return true;
    }

    final permanentlyDenied = statuses.values.any((status) => status.isPermanentlyDenied);
    if (permanentlyDenied) {
      await openAppSettings();
    }

    return await PrintBluetoothThermal.isPermissionBluetoothGranted;
  }

  Future<void> _printTo(BluetoothInfo device) async {
    setState(() {
      _printing = true;
    });

    try {
      final connected = await PrintBluetoothThermal.connect(macPrinterAddress: device.macAdress);
      if (!connected) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal connect ke printer: ${device.name}')),
        );
        return;
      }

      final ok = await PrintBluetoothThermal.writeBytes(widget.bytes);
      await PrintBluetoothThermal.disconnect;

      if (!mounted) return;

      if (!ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal print. Coba ulang / ganti printer.')),
        );
        return;
      }

      await HiveService.cacheBox.put(_keyDefaultPrinterMac, device.macAdress);
      await HiveService.cacheBox.put(_keyDefaultPrinterName, device.name);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Berhasil print di ${device.name}')),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error print: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _printing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final defaultName = HiveService.cacheBox.get(_keyDefaultPrinterName) as String?;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    widget.title ?? 'Pilih Printer Bluetooth',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  tooltip: 'Refresh',
                  onPressed: _printing ? null : _load,
                  icon: const Icon(Icons.refresh),
                ),
              ],
            ),
            if (defaultName != null && defaultName.isNotEmpty) ...[
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Default: $defaultName',
                  style: TextStyle(color: Colors.grey.shade700),
                ),
              ),
              const SizedBox(height: 8),
            ],
            if (_loading) ...[
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator()),
              ),
            ] else if (_error != null) ...[
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            ] else if (_devices.isEmpty) ...[
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('Belum ada printer ter-pair. Pair printer via Bluetooth Settings dulu.'),
              ),
            ] else ...[
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: _devices.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final device = _devices[index];
                    final isDefault = _defaultMac != null && _defaultMac == device.macAdress;
                    return ListTile(
                      enabled: !_printing,
                      leading: Icon(isDefault ? Icons.star : Icons.print),
                      title: Text(device.name),
                      subtitle: Text(device.macAdress),
                      trailing: _printing ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : null,
                      onTap: _printing ? null : () => _printTo(device),
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
