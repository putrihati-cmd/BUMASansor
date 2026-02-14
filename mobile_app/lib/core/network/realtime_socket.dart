import 'package:socket_io_client/socket_io_client.dart' as io;

class RealtimeSocket {
  RealtimeSocket({
    required String apiBaseUrl,
    required String token,
  }) : _socket = io.io(
          _socketOrigin(apiBaseUrl),
          <String, dynamic>{
            'transports': ['websocket'],
            'autoConnect': false,
            'auth': <String, dynamic>{
              'token': token,
            },
          },
        );

  final io.Socket _socket;

  static String _socketOrigin(String apiBaseUrl) {
    var url = apiBaseUrl.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    if (url.endsWith('/api')) {
      url = url.substring(0, url.length - 4);
    }
    return url;
  }

  void connect() => _socket.connect();

  void disconnect() => _socket.disconnect();

  void on(String event, void Function(dynamic data) handler) => _socket.on(event, handler);

  void dispose() {
    _socket.dispose();
  }
}

