class UserModel {
  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.warungId,
  });

  final String id;
  final String email;
  final String name;
  final String role;
  final String? warungId;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      warungId: json['warungId'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'role': role,
        'warungId': warungId,
      };
}
