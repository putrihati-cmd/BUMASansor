import 'dart:typed_data';

import '../datasources/remote/upload_remote_datasource.dart';

class UploadRepository {
  UploadRepository(this._remoteDataSource);

  final UploadRemoteDataSource _remoteDataSource;

  Future<String> uploadBytes(Uint8List bytes, {required String filename}) {
    return _remoteDataSource.uploadBytes(bytes, filename: filename);
  }
}
