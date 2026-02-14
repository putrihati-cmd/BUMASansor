import '../datasources/remote/user_remote_datasource.dart';
import '../models/user_model.dart';

class UserRepository {
  UserRepository(this._remoteDataSource);

  final UserRemoteDataSource _remoteDataSource;

  Future<List<UserModel>> fetchUsers() {
    return _remoteDataSource.fetchUsers();
  }
}
