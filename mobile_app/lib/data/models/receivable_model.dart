import 'warung_model.dart';

class PaymentModel {
  PaymentModel({
    required this.id,
    required this.receivableId,
    required this.amount,
    required this.method,
    this.proofUrl,
    this.notes,
    this.paymentDate,
    this.verifiedBy,
  });

  final String id;
  final String receivableId;
  final double amount;
  final String method;
  final String? proofUrl;
  final String? notes;
  final DateTime? paymentDate;
  final String? verifiedBy;

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) =>
        double.tryParse(value?.toString() ?? '0') ?? 0;

    DateTime? parseDate(dynamic value) {
      if (value == null) {
        return null;
      }
      return DateTime.tryParse(value.toString());
    }

    return PaymentModel(
      id: json['id'] as String,
      receivableId: json['receivableId'] as String? ?? '-',
      amount: toDouble(json['amount']),
      method: json['method'] as String? ?? '-',
      proofUrl: json['proofUrl'] as String?,
      notes: json['notes'] as String?,
      paymentDate: parseDate(json['paymentDate']),
      verifiedBy: json['verifiedBy'] as String?,
    );
  }
}

class ReceivableModel {
  ReceivableModel({
    required this.id,
    required this.warungId,
    required this.amount,
    required this.balance,
    required this.status,
    required this.dueDate,
    this.warung,
    this.deliveryOrderId,
    this.notes,
    this.createdAt,
    this.payments = const [],
  });

  final String id;
  final String warungId;
  final double amount;
  final double balance;
  final String status;
  final DateTime dueDate;

  final WarungModel? warung;
  final String? deliveryOrderId;
  final String? notes;
  final DateTime? createdAt;
  final List<PaymentModel> payments;

  double get paidAmount => amount - balance;

  factory ReceivableModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) =>
        double.tryParse(value?.toString() ?? '0') ?? 0;

    final warungJson = json['warung'];
    final warung = warungJson is Map<String, dynamic>
        ? WarungModel.fromJson(warungJson)
        : null;

    final paymentsJson =
        (json['payments'] as List<dynamic>? ?? const []).cast<dynamic>();

    final due =
        DateTime.tryParse(json['dueDate']?.toString() ?? '') ?? DateTime.now();
    final created = DateTime.tryParse(json['createdAt']?.toString() ?? '');

    return ReceivableModel(
      id: json['id'] as String,
      warungId: json['warungId'] as String? ?? warung?.id ?? '-',
      deliveryOrderId: json['deliveryOrderId'] as String?,
      amount: toDouble(json['amount']),
      balance: toDouble(json['balance']),
      status: json['status'] as String? ?? '-',
      dueDate: due,
      notes: json['notes'] as String?,
      createdAt: created,
      warung: warung,
      payments: paymentsJson
          .whereType<Map<String, dynamic>>()
          .map((p) => PaymentModel.fromJson(p))
          .toList(),
    );
  }
}

class ReceivableMeta {
  ReceivableMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  factory ReceivableMeta.fromJson(Map<String, dynamic> json) {
    return ReceivableMeta(
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 10,
      total: (json['total'] as num?)?.toInt() ?? 0,
      totalPages: (json['totalPages'] as num?)?.toInt() ?? 0,
    );
  }
}

class ReceivableListResponse {
  ReceivableListResponse({required this.items, required this.meta});

  final List<ReceivableModel> items;
  final ReceivableMeta meta;

  factory ReceivableListResponse.fromJson(Map<String, dynamic> json) {
    final itemsJson =
        (json['items'] as List<dynamic>? ?? const []).cast<dynamic>();
    final metaJson = (json['meta'] as Map<String, dynamic>? ?? const {});

    return ReceivableListResponse(
      items: itemsJson
          .whereType<Map<String, dynamic>>()
          .map((item) => ReceivableModel.fromJson(item))
          .toList(),
      meta: ReceivableMeta.fromJson(metaJson),
    );
  }
}
