import 'dart:convert';
import 'dart:io';

import 'package:package_info_plus/package_info_plus.dart';

import 'api_service.dart';

/// Service untuk mengecek update aplikasi dari server.
///
/// Memanggil `GET /api/v1/app/version` untuk mendapatkan info versi terbaru,
/// lalu membandingkan dengan versi yang terinstall di device.
class UpdateService {
  UpdateService._();

  static final UpdateService instance = UpdateService._();

  /// Base URL API — ganti ke production setelah deploy.
  static const _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://comika.free.nf',
  );

  /// Cek update dari server.
  ///
  /// Mengembalikan [UpdateInfo] jika ada update tersedia,
  /// atau `null` jika sudah versi terbaru.
  Future<UpdateInfo?> checkForUpdate() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version; // e.g. "1.0.0"

      final response = await ApiService.instance.get(
        '$_baseUrl/api/v1/app/version',
      );

      final data = response['data'] as Map<String, dynamic>?;
      if (data == null) return null;

      final latestVersion = data['latest_version'] as String? ?? '';
      final downloadUrl = data['download_url'] as String? ?? '';
      final releaseNotes = data['release_notes'] as String? ?? '';
      final releasedAt = data['released_at'] as String? ?? '';

      if (latestVersion.isEmpty) return null;

      // Bandingkan versi: return update jika latest > current
      if (_isNewerVersion(latestVersion, currentVersion)) {
        return UpdateInfo(
          latestVersion: latestVersion,
          currentVersion: currentVersion,
          downloadUrl: downloadUrl,
          releaseNotes: releaseNotes,
          releasedAt: releasedAt,
        );
      }

      return null;
    } catch (e) {
      // Jangan crash app hanya karena gagal cek update
      return null;
    }
  }

  /// Bandingkan dua versi semantic (major.minor.patch).
  /// Mengembalikan `true` jika `a` lebih baru dari `b`.
  bool _isNewerVersion(String a, String b) {
    final aParts = a.split('.').map(int.tryParse).toList();
    final bParts = b.split('.').map(int.tryParse).toList();

    // Pastikan minimal 3 bagian
    while (aParts.length < 3) {
      aParts.add(0);
    }
    while (bParts.length < 3) {
      bParts.add(0);
    }

    for (var i = 0; i < 3; i++) {
      final av = aParts[i] ?? 0;
      final bv = bParts[i] ?? 0;
      if (av > bv) return true;
      if (av < bv) return false;
    }

    return false;
  }
}

/// Info update yang tersedia dari server.
class UpdateInfo {
  final String latestVersion;
  final String currentVersion;
  final String downloadUrl;
  final String releaseNotes;
  final String releasedAt;

  const UpdateInfo({
    required this.latestVersion,
    required this.currentVersion,
    required this.downloadUrl,
    required this.releaseNotes,
    required this.releasedAt,
  });
}
