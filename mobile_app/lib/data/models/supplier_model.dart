class SupplierModel {
  SupplierModel({
    required this.id,
    required this.name,
    this.contact,
    this.phone,
    this.address,
  });

  final String id;
  final String name;
  final String? contact;
  final String? phone;
  final String? address;

  factory SupplierModel.fromJson(Map<String, dynamic> json) {
    return SupplierModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '-',
      contact: json['contact'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'contact': contact,
      'phone': phone,
      'address': address,
    };
  }
}
