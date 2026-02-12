class DashboardModel {
  DashboardModel({
    required this.transactions,
    required this.omzet,
    required this.outstandingReceivables,
    required this.lowStockCount,
  });

  final int transactions;
  final double omzet;
  final double outstandingReceivables;
  final int lowStockCount;

  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    final today = json['today'] as Map<String, dynamic>? ?? {};
    final receivables = json['receivables'] as Map<String, dynamic>? ?? {};
    final stocks = json['stocks'] as Map<String, dynamic>? ?? {};

    return DashboardModel(
      transactions: int.tryParse(today['transactions']?.toString() ?? '0') ?? 0,
      omzet: double.tryParse(today['omzet']?.toString() ?? '0') ?? 0,
      outstandingReceivables: double.tryParse(receivables['outstanding']?.toString() ?? '0') ?? 0,
      lowStockCount: int.tryParse(stocks['lowStockCount']?.toString() ?? '0') ?? 0,
    );
  }
}
