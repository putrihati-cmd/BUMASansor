class WarungModel {
  WarungModel({
    required this.id,
    required this.name,
    required this.ownerName,
    this.phone,
    this.address,
    this.region,
    required this.creditLimit,
    required this.creditDays,
    required this.currentDebt,
    required this.isBlocked,
    this.blockedReason,
    this.latitude,
    this.longitude,
  });

  final String id;
  final String name;
  final String ownerName;
  final String? phone;
  final String? address;
  final String? region;
  final double creditLimit;
  final int creditDays;
  final double currentDebt;
  final bool isBlocked;
  final String? blockedReason;
  final double? latitude;
  final double? longitude;

  factory WarungModel.fromJson(Map<String, dynamic> json) {
    double? toDouble(dynamic value) {
      if (value == null) {
        return null;
      }
      return double.tryParse(value.toString());
    }

    return WarungModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '-',
      ownerName: json['ownerName'] as String? ?? '-',
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      region: json['region'] as String?,
      creditLimit: toDouble(json['creditLimit']) ?? 0,
      creditDays: int.tryParse(json['creditDays']?.toString() ?? '') ?? 14,
      currentDebt: toDouble(json['currentDebt']) ?? 0,
      isBlocked: (json['isBlocked'] as bool?) ?? false,
      blockedReason: json['blockedReason'] as String?,
      latitude: toDouble(json['latitude']),
      longitude: toDouble(json['longitude']),
    );
  }
}

class WarungCreditStatusModel {
  WarungCreditStatusModel({
    required this.warungId,
    required this.creditLimit,
    required this.currentDebt,
    required this.availableCredit,
    required this.creditDays,
    required this.isBlocked,
    this.blockedReason,
  });

  final String warungId;
  final double creditLimit;
  final double currentDebt;
  final double availableCredit;
  final int creditDays;
  final bool isBlocked;
  final String? blockedReason;

  factory WarungCreditStatusModel.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic value) {
      return double.tryParse(value?.toString() ?? '0') ?? 0;
    }

    return WarungCreditStatusModel(
      warungId: json['warungId'] as String,
      creditLimit: toDouble(json['creditLimit']),
      currentDebt: toDouble(json['currentDebt']),
      availableCredit: toDouble(json['availableCredit']),
      creditDays: int.tryParse(json['creditDays']?.toString() ?? '') ?? 14,
      isBlocked: (json['isBlocked'] as bool?) ?? false,
      blockedReason: json['blockedReason'] as String?,
    );
  }
}
