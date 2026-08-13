import 'dart:convert';
import 'dart:io';

/// HTTP client sederhana berbasis HttpClient bawaan Dart.
/// Menghindari dependency eksternal sehingga MVP tetap ringan
/// dan mudah di-deploy (sesuai blueprint infrastructure rule).
class ApiService {
  ApiService._();

  static final ApiService instance = ApiService._();

  String? _token;

  /// Simpan token autentikasi setelah login.
  void setToken(String token) => _token = token;

  String? get token => _token;

  void clearToken() => _token = null;

  Future<Map<String, dynamic>> get(String path, [Map<String, dynamic>? query]) =>
      _request('GET', path, null, query);

  Future<Map<String, dynamic>> post(String path, [Map<String, dynamic>? body]) =>
      _request('POST', path, body);

  Future<Map<String, dynamic>> put(String path, [Map<String, dynamic>? body]) =>
      _request('PUT', path, body);

  Future<Map<String, dynamic>> patch(String path, [Map<String, dynamic>? body]) =>
      _request('PATCH', path, body);

  Future<Map<String, dynamic>> delete(String path) =>
      _request('DELETE', path);

  Future<Map<String, dynamic>> _request(
    String method,
    String path, [
    Map<String, dynamic>? body,
    Map<String, dynamic>? query,
  ]) async {
    final client = HttpClient();
    try {
      var uri = Uri.parse(path);
      if (query != null && query.isNotEmpty) {
        uri = uri.replace(queryParameters: {
          ...uri.queryParameters,
          ...query.map((k, v) => MapEntry(k, v.toString())),
        });
      }

      final request = await client.openUrl(method, uri);
      request.headers.set(HttpHeaders.acceptHeader, 'application/json');
      request.headers.set(HttpHeaders.contentTypeHeader, 'application/json');
      if (_token != null) {
        request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $_token');
      }
      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close().timeout(const Duration(seconds: 20));
      final raw = await response.transform(utf8.decoder).join();

      Map<String, dynamic>? json;
      if (raw.isNotEmpty) {
        try {
          json = jsonDecode(raw) as Map<String, dynamic>;
        } catch (_) {
          json = null;
        }
      }

      if (response.statusCode >= 400) {
        throw ApiException(
          json?['message'] as String? ?? 'Terjadi kesalahan (${response.statusCode})',
          statusCode: response.statusCode,
          errors: json?['errors'],
        );
      }
      return json ?? <String, dynamic>{};
    } finally {
      client.close(force: true);
    }
  }
}

/// Error API dengan pesan & detail validasi dari backend.
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic errors;

  ApiException(this.message, {this.statusCode, this.errors});

  @override
  String toString() => message;
}
