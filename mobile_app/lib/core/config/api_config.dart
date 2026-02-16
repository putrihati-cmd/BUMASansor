class ApiConfig {
  // Configure per-environment using:
  //   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://bumas.infiatin.cloud/api',
  );
}
