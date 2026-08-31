import 'dart:io';

import 'package:flutter/foundation.dart';

import '../core/constants/api_constants.dart';
import '../models/user.dart';
import 'api_service.dart';

/// Manajemen autentikasi & sesi user.
/// Token disimpan persisten via shared_preferences.
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

  /// Cek sesi tersimpan (token). Jika token ada, ambil data user dari server.
  Future<void> init() async {
    await _api.loadToken();

    if (_api.token != null) {
      try {
        final res = await _api.get(ApiConstants.me);
        final data = res['data'] as Map<String, dynamic>;
        _user = User.fromJson(data);
      } catch (_) {
        // Token expired/invalid — bersihkan
        _api.clearToken();
        _user = null;
      }
    }

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

  /// Cek apakah user yang sedang login sedang diblokir.
  /// Return null jika tidak diblokir, atau String pesan error jika diblokir.
  String? checkBanStatus() {
    if (_user == null) return null;
    if (_user!.isPermanentlyBanned) {
      return 'Akun Anda telah diblokir permanen oleh admin.';
    }
    if (_user!.isBanned) {
      return 'Akun Anda sedang diblokir oleh admin. ${_user!.banReason ?? ''}';
    }
    return null;
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

  /// Hapus avatar — kembalikan ke fallback inisial.
  Future<User> deleteAvatar() async {
    final res = await _api.delete(ApiConstants.meAvatar);
    final user = User.fromJson(res['data'] as Map<String, dynamic>);
    _user = user;
    notifyListeners();
    return user;
  }

  /// Upload avatar.
  Future<User> uploadAvatar(String filePath) async {
    final fileName = filePath.split('/').last;
    final ext = fileName.split('.').last.toLowerCase();
    final mime = switch (ext) {
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      'webp' => 'image/webp',
      _ => 'image/jpeg',
    };

    final file = await File(filePath).readAsBytes();
    final multipart = MultipartFile(
      field: 'avatar',
      filename: fileName,
      contentType: mime,
      bytes: file,
    );

    final form = <String, String>{
      '_method': 'PUT',
      'name': _user?.name ?? '',
    };

    final res = await _api.upload(
      ApiConstants.meProfile,
      form,
      [multipart],
      method: 'POST',
    );
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
