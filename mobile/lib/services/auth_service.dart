import 'package:flutter/foundation.dart';

import '../core/constants/api_constants.dart';
import '../models/user.dart';
import 'api_service.dart';

/// Manajemen autentikasi & sesi user.
/// Token disimpan di memori (MVP) — persisten via shared_preferences
/// dapat ditambahkan di fase berikutnya.
class AuthService extends ChangeNotifier {
  AuthService._() {
    _api = ApiService.instance;
  }

  static final AuthService instance = AuthService._();

  late final ApiService _api;

  User? _user;
  bool _initialized = false;

  User? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isInitialized => _initialized;

  /// Cek sesi tersimpan (token). Tanpa penyimpanan persisten,
  /// MVP dimulai dari layar login.
  Future<void> init() async {
    _initialized = true;
    notifyListeners();
  }

  Future<User> login(String email, String password) async {
    final res = await _api.post(ApiConstants.login, {
      'email': email,
      'password': password,
    });
    final data = res['data'] as Map<String, dynamic>;
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token'] as String;
    _api.setToken(token);
    _user = user;
    notifyListeners();
    return user;
  }

  Future<User> register({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {
    final res = await _api.post(ApiConstants.register, {
      'name': name,
      'username': username,
      'email': email,
      'password': password,
      'password_confirmation': password,
    });
    final data = res['data'] as Map<String, dynamic>;
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token'] as String;
    _api.setToken(token);
    _user = user;
    notifyListeners();
    return user;
  }

  Future<User> me() async {
    final res = await _api.get(ApiConstants.me);
    final user = User.fromJson(res['data'] as Map<String, dynamic>);
    _user = user;
    notifyListeners();
    return user;
  }

  /// Ganti password akun (butuh password saat ini).
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _api.put(ApiConstants.mePassword, {
      'current_password': currentPassword,
      'password': newPassword,
      'password_confirmation': newPassword,
    });
  }

  /// Ubah nama tampilan.
  Future<User> updateProfile({required String name}) async {
    final res = await _api.put(ApiConstants.meProfile, {'name': name});
    final user = User.fromJson(res['data'] as Map<String, dynamic>);
    _user = user;
    notifyListeners();
    return user;
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiConstants.logout);
    } catch (_) {
      // abaikan error jaringan — token lokal tetap dibersihkan
    }
    _api.clearToken();
    _user = null;
    notifyListeners();
  }
}
