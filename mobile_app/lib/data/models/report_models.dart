class DailyReportModel {
  DailyReportModel({
    required this.date,
    required this.transactions,
    required this.omzet,
    required this.paid,
    required this.paymentsCount,
    required this.collected,
  });

  final String date;
  final int transactions;
  final double omzet;
  final double paid;
  final int paymentsCount;
  final double collected;

  factory DailyReportModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) => double.tryParse(value?.toString() ?? '0') ?? 0;

    final sales = (json['sales'] as Map<String, dynamic>? ?? const {});
    final payments = (json['payments'] as Map<String, dynamic>? ?? const {});

    return DailyReportModel(
      date: json['date'] as String? ?? '-',
      transactions: (sales['transactions'] as num?)?.toInt() ?? 0,
      omzet: toDouble(sales['omzet']),
      paid: toDouble(sales['paid']),
      paymentsCount: (payments['count'] as num?)?.toInt() ?? 0,
      collected: toDouble(payments['collected']),
    );
  }
}

class MonthlyReportModel {
  MonthlyReportModel({
    required this.period,
    required this.transactions,
    required this.omzet,
    required this.paid,
    required this.receivablesCreated,
    required this.receivablesOutstanding,
    required this.collectionsAmount,
  });

  final String period;
  final int transactions;
  final double omzet;
  final double paid;
  final double receivablesCreated;
  final double receivablesOutstanding;
  final double collectionsAmount;

  factory MonthlyReportModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) => double.tryParse(value?.toString() ?? '0') ?? 0;

    final sales = (json['sales'] as Map<String, dynamic>? ?? const {});
    final receivables = (json['receivables'] as Map<String, dynamic>? ?? const {});
    final collections = (json['collections'] as Map<String, dynamic>? ?? const {});

    return MonthlyReportModel(
      period: json['period'] as String? ?? '-',
      transactions: (sales['transactions'] as num?)?.toInt() ?? 0,
      omzet: toDouble(sales['omzet']),
      paid: toDouble(sales['paid']),
      receivablesCreated: toDouble(receivables['created']),
      receivablesOutstanding: toDouble(receivables['outstanding']),
      collectionsAmount: toDouble(collections['amount']),
    );
  }
}

class WarungPerformanceModel {
  WarungPerformanceModel({
    required this.warungId,
    required this.warungName,
    required this.totalOrders,
    required this.totalPurchase,
    required this.totalPayment,
    required this.currentDebt,
    required this.paymentScore,
    required this.status,
  });

  final String warungId;
  final String warungName;
  final int totalOrders;
  final double totalPurchase;
  final double totalPayment;
  final double currentDebt;
  final int paymentScore;
  final String status;

  factory WarungPerformanceModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) => double.tryParse(value?.toString() ?? '0') ?? 0;

    return WarungPerformanceModel(
      warungId: json['warungId'] as String? ?? '-',
      warungName: json['warungName'] as String? ?? '-',
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
      totalPurchase: toDouble(json['totalPurchase']),
      totalPayment: toDouble(json['totalPayment']),
      currentDebt: toDouble(json['currentDebt']),
      paymentScore: (json['paymentScore'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? '-',
    );
  }
}

class WarungPerformanceResponse {
  WarungPerformanceResponse({required this.period, required this.warungs});

  final String period;
  final List<WarungPerformanceModel> warungs;

  factory WarungPerformanceResponse.fromJson(Map<String, dynamic> json) {
    final items = (json['warungs'] as List<dynamic>? ?? const []).cast<dynamic>();
    return WarungPerformanceResponse(
      period: json['period'] as String? ?? '-',
      warungs: items
          .whereType<Map<String, dynamic>>()
          .map((w) => WarungPerformanceModel.fromJson(w))
          .toList(),
    );
  }
}
