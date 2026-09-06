import 'dart:convert';
import 'dart:io';

import 'package:shared_preferences/shared_preferences.dart';

/// HTTP client sederhana berbasis HttpClient bawaan Dart.
/// Menghindari dependency eksternal sehingga MVP tetap ringan
/// dan mudah di-deploy (sesuai blueprint infrastructure rule).
///
/// Mendukung:
/// - Persistent token (shared_preferences)
/// - Multipart file upload
class ApiService {
  ApiService._();

  static final ApiService instance = ApiService._();

  String? _token;
  static const _tokenKey = 'comika_auth_token';

  /// Simpan token autentikasi setelah login.
  void setToken(String token) {
    _token = token;
    // Persist ke storage
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString(_tokenKey, token);
    });
  }

  String? get token => _token;

  void clearToken() {
    _token = null;
    SharedPreferences.getInstance().then((prefs) {
      prefs.remove(_tokenKey);
    });
  }

  /// Load token dari persistent storage saat app start.
  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
  }

  Future<Map<String, dynamic>> get(String path, [Map<String, dynamic>? query]) =>
      _request('GET', path, null, query);

  Future<Map<String, dynamic>> post(String path, [Map<String, dynamic>? body]) =>
      _request('POST', path, body);

  Future<Map<String, dynamic>> put(String path, [Map<String, dynamic>? body]) =>
      _request('PUT', path, body);

  Future<Map<String, dynamic>> patch(String path, [Map<String, dynamic>? body]) =>
      _request('PATCH', path, body);  Future<Map<String, dynamic>> delete(String path) => _request('DELETE', path);

  /// Download gambar sebagai bytes (untuk offline download).
  Future<List<int>> downloadImage(String url) async {
    final client = HttpClient();
    try {
      final request = await client.getUrl(Uri.parse(url));
      if (_token != null) {
        request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $_token');
      }
      final response = await request.close().timeout(const Duration(seconds: 30));
      if (response.statusCode >= 400) {
        throw ApiException('Gagal download gambar (${response.statusCode})', statusCode: response.statusCode);
      }
      return await response.fold<List<int>>([], (prev, chunk) => prev..addAll(chunk));
    } finally {
      client.close(force: true);
    }
  }

  /// Upload file (multipart) ke endpoint — untuk avatar, cover, banner, dll.
  Future<Map<String, dynamic>> upload(
    String path,
    Map<String, String> fields,
    List<MultipartFile> files, {
    String method = 'POST',
  }) async {
    final client = HttpClient();
    try {
      final uri = Uri.parse(path);
      final request = await client.openUrl(method, uri);
      final boundary = '----ComikaBoundary${DateTime.now().millisecondsSinceEpoch}';

      request.headers.set(
        HttpHeaders.contentTypeHeader,
        'multipart/form-data; boundary=$boundary',
      );
      request.headers.set(HttpHeaders.acceptHeader, 'application/json');
      if (_token != null) {
        request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $_token');
      }

      // Tulis fields
      for (final entry in fields.entries) {
        request.write('--$boundary\r\n');
        request.write('Content-Disposition: form-data; name="${entry.key}"\r\n\r\n');
        request.write('${entry.value}\r\n');
      }

      // Tulis files
      for (final file in files) {
        request.write('--$boundary\r\n');
        request.write(
          'Content-Disposition: form-data; name="${file.field}"; filename="${file.filename}"\r\n',
        );
        request.write('Content-Type: ${file.contentType}\r\n\r\n');
        request.write(file.bytes);
        request.write('\r\n');
      }

      request.write('--$boundary--\r\n');

      final response = await request.close().timeout(const Duration(seconds: 60));
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

/// Representasi file untuk upload multipart.
class MultipartFile {
  final String field;
  final String filename;
  final String contentType;
  final List<int> bytes;

  const MultipartFile({
    required this.field,
    required this.filename,
    required this.contentType,
    required this.bytes,
  });
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
