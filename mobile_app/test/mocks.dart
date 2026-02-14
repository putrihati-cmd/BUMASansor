import 'package:mockito/annotations.dart';

import 'package:bumas_app/data/datasources/local/secure_storage_service.dart';
import 'package:bumas_app/data/datasources/remote/auth_remote_datasource.dart';
import 'package:bumas_app/data/repositories/auth_repository.dart';

@GenerateNiceMocks([
  MockSpec<AuthRemoteDataSource>(),
  MockSpec<SecureStorageService>(),
  MockSpec<AuthRepository>(),
])
void main() {}
