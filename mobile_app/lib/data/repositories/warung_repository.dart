import '../datasources/remote/warung_remote_datasource.dart';
import '../models/warung_model.dart';

class WarungRepository {
  WarungRepository(this._remote);

  final WarungRemoteDataSource _remote;

  Future<List<WarungModel>> fetchWarungs({
    String? search,
    bool? blocked,
    int page = 1,
    int limit = 100,
  }) {
    return _remote.fetchWarungs(
        search: search, blocked: blocked, page: page, limit: limit);
  }

  Future<WarungModel> fetchWarungById(String id) {
    return _remote.fetchWarungById(id);
  }

  Future<WarungModel> createWarung({
    required String name,
    required String ownerName,
    String? phone,
    String? address,
    String? region,
    required double creditLimit,
    required int creditDays,
    double? latitude,
    double? longitude,
  }) {
    return _remote.createWarung({
      'name': name,
      'ownerName': ownerName,
      if (phone != null) 'phone': phone,
      if (address != null) 'address': address,
      if (region != null) 'region': region,
      'creditLimit': creditLimit,
      'creditDays': creditDays,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
    });
  }

  Future<WarungModel> updateWarung({
    required String id,
    String? name,
    String? ownerName,
    String? phone,
    String? address,
    String? region,
    double? creditLimit,
    int? creditDays,
    double? latitude,
    double? longitude,
  }) {
    final payload = <String, dynamic>{};

    if (name != null) payload['name'] = name;
    if (ownerName != null) payload['ownerName'] = ownerName;
    if (phone != null) payload['phone'] = phone;
    if (address != null) payload['address'] = address;
    if (region != null) payload['region'] = region;
    if (creditLimit != null) payload['creditLimit'] = creditLimit;
    if (creditDays != null) payload['creditDays'] = creditDays;
    if (latitude != null) payload['latitude'] = latitude;
    if (longitude != null) payload['longitude'] = longitude;

    return _remote.updateWarung(id, payload);
  }

  Future<void> deleteWarung(String id) {
    return _remote.deleteWarung(id);
  }

  Future<WarungModel> blockWarung(String id, {required String reason}) {
    return _remote.blockWarung(id, reason: reason);
  }

  Future<WarungModel> unblockWarung(String id) {
    return _remote.unblockWarung(id);
  }

  Future<WarungCreditStatusModel> creditStatus(String id) {
    return _remote.fetchCreditStatus(id);
  }
}
