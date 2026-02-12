class DeliveryOrderModel {
  DeliveryOrderModel({
    required this.id,
    required this.doNumber,
    required this.status,
    required this.warungName,
    required this.totalAmount,
  });

  final String id;
  final String doNumber;
  final String status;
  final String warungName;
  final double totalAmount;

  factory DeliveryOrderModel.fromJson(Map<String, dynamic> json) {
    final warung = json['warung'] as Map<String, dynamic>?;

    return DeliveryOrderModel(
      id: json['id'] as String,
      doNumber: json['doNumber'] as String? ?? '-',
      status: json['status'] as String? ?? '-',
      warungName: warung?['name'] as String? ?? '-',
      totalAmount: double.tryParse(json['totalAmount']?.toString() ?? '0') ?? 0,
    );
  }
}
