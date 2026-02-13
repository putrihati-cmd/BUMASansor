class WarehouseModel {
  WarehouseModel({
    required this.id,
    required this.name,
    required this.location,
  });

  final String id;
  final String name;
  final String location;

  factory WarehouseModel.fromJson(Map<String, dynamic> json) {
    return WarehouseModel(
      id: json['id'] as String,
      name: json['name'] as String,
      location: json['location'] as String,
    );
  }
}