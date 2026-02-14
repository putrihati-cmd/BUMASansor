class DashboardModel {
  DashboardModel({
    required this.today,
    required this.receivables,
    required this.warungs,
    required this.stocks,
    required this.topProducts,
    this.chart,
  });

  final DashboardToday today;
  final DashboardReceivables receivables;
  final DashboardWarungs warungs;
  final DashboardStocks stocks;
  final List<DashboardTopProduct> topProducts;
  final DashboardChart? chart;

  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    final today = json['today'] as Map<String, dynamic>? ?? const {};
    final receivables =
        json['receivables'] as Map<String, dynamic>? ?? const {};
    final warungs = json['warungs'] as Map<String, dynamic>? ?? const {};
    final stocks = json['stocks'] as Map<String, dynamic>? ?? const {};
    final chart = json['chart'] as Map<String, dynamic>?;

    final topProductsRaw =
        (json['topProducts'] as List<dynamic>? ?? const []).cast<dynamic>();

    return DashboardModel(
      today: DashboardToday.fromJson(today),
      receivables: DashboardReceivables.fromJson(receivables),
      warungs: DashboardWarungs.fromJson(warungs),
      stocks: DashboardStocks.fromJson(stocks),
      topProducts: topProductsRaw
          .map((row) =>
              DashboardTopProduct.fromJson(row as Map<String, dynamic>))
          .toList(),
      chart: chart == null ? null : DashboardChart.fromJson(chart),
    );
  }
}

class DashboardChart {
  DashboardChart({required this.omzetBulanan});

  final DashboardMonthlyChart omzetBulanan;

  factory DashboardChart.fromJson(Map<String, dynamic> json) {
    final monthly = json['omzetBulanan'] as Map<String, dynamic>? ?? const {};
    return DashboardChart(
      omzetBulanan: DashboardMonthlyChart.fromJson(monthly),
    );
  }
}

class DashboardMonthlyChart {
  DashboardMonthlyChart({
    required this.labels,
    required this.omzet,
    required this.pengeluaran,
  });

  final List<String> labels;
  final List<double> omzet;
  final List<double> pengeluaran;

  factory DashboardMonthlyChart.fromJson(Map<String, dynamic> json) {
    List<double> toDoubles(dynamic value) {
      final list = (value as List<dynamic>? ?? const []).cast<dynamic>();
      return list.map((item) => double.tryParse(item.toString()) ?? 0).toList();
    }

    final labelsRaw =
        (json['labels'] as List<dynamic>? ?? const []).cast<dynamic>();

    return DashboardMonthlyChart(
      labels: labelsRaw.map((item) => item.toString()).toList(),
      omzet: toDoubles(json['omzet']),
      pengeluaran: toDoubles(json['pengeluaran']),
    );
  }
}

class DashboardToday {
  DashboardToday({
    required this.transactions,
    required this.omzet,
    required this.cashIn,
    required this.receivableIncrease,
    required this.profitEstimate,
  });

  final int transactions;
  final double omzet;
  final double cashIn;
  final double receivableIncrease;

  // Backend belum menyediakan profit secara eksplisit di /reports/dashboard.
  // Tetap sediakan field ini untuk UI (nilai default 0).
  final double profitEstimate;

  factory DashboardToday.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) =>
        double.tryParse(value?.toString() ?? '0') ?? 0;

    return DashboardToday(
      transactions: int.tryParse(json['transactions']?.toString() ?? '0') ?? 0,
      omzet: toDouble(json['omzet']),
      cashIn: toDouble(json['cashIn']),
      receivableIncrease: toDouble(json['receivableIncrease']),
      profitEstimate: toDouble(json['profitEstimate']),
    );
  }
}

class DashboardReceivables {
  DashboardReceivables({required this.outstanding});

  final double outstanding;

  factory DashboardReceivables.fromJson(Map<String, dynamic> json) {
    final value = double.tryParse(json['outstanding']?.toString() ?? '0') ?? 0;
    return DashboardReceivables(outstanding: value);
  }
}

class DashboardWarungs {
  DashboardWarungs({required this.active, required this.blocked});

  final int active;
  final int blocked;

  factory DashboardWarungs.fromJson(Map<String, dynamic> json) {
    return DashboardWarungs(
      active: int.tryParse(json['active']?.toString() ?? '0') ?? 0,
      blocked: int.tryParse(json['blocked']?.toString() ?? '0') ?? 0,
    );
  }
}

class DashboardStocks {
  DashboardStocks({required this.lowStockCount, required this.totalValue});

  final int lowStockCount;
  final double totalValue;

  factory DashboardStocks.fromJson(Map<String, dynamic> json) {
    return DashboardStocks(
      lowStockCount:
          int.tryParse(json['lowStockCount']?.toString() ?? '0') ?? 0,
      totalValue: double.tryParse(json['totalValue']?.toString() ?? '0') ?? 0,
    );
  }
}

class DashboardTopProduct {
  DashboardTopProduct({
    required this.rank,
    required this.productId,
    required this.productName,
    required this.barcode,
    required this.quantitySold,
    required this.revenue,
  });

  final int rank;
  final String productId;
  final String productName;
  final String barcode;
  final int quantitySold;
  final double revenue;

  factory DashboardTopProduct.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) =>
        double.tryParse(value?.toString() ?? '0') ?? 0;

    return DashboardTopProduct(
      rank: int.tryParse(json['rank']?.toString() ?? '0') ?? 0,
      productId: json['productId'] as String? ?? '-',
      productName: json['productName'] as String? ?? '-',
      barcode: json['barcode'] as String? ?? '-',
      quantitySold: int.tryParse(json['quantitySold']?.toString() ?? '0') ?? 0,
      revenue: toDouble(json['revenue']),
    );
  }
}
