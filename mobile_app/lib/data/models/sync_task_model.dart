class SyncTaskModel {
  SyncTaskModel({
    required this.id,
    required this.endpoint,
    required this.method,
    required this.payload,
    required this.createdAt,
  });

  final String id;
  final String endpoint;
  final String method;
  final Map<String, dynamic> payload;
  final DateTime createdAt;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'endpoint': endpoint,
      'method': method,
      'payload': payload,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory SyncTaskModel.fromJson(Map<dynamic, dynamic> map) {
    return SyncTaskModel(
      id: map['id'] as String,
      endpoint: map['endpoint'] as String,
      method: map['method'] as String,
      payload: Map<String, dynamic>.from(map['payload'] as Map),
      createdAt: DateTime.parse(map['createdAt'] as String),
    );
  }
}
