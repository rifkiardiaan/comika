import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Service untuk menampilkan notifikasi system-level saat download episode.
class DownloadNotificationService {
  DownloadNotificationService._();
  static final DownloadNotificationService instance = DownloadNotificationService._();

  final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  static const _channelId = 'comika_downloads';
  static const _channelName = 'Download Komik';
  static const _channelDesc = 'Notifikasi progress download episode komik';

  /// Inisialisasi notification plugin.
  ///
  /// Di Android 13+ (API 33) izin [Permission.notification] harus diminta
  /// secara runtime — tanpa ini notifikasi download tidak akan muncul.
  /// Dipanggil dari [main.dart] dan sebelum download dimulai.
  Future<void> init() async {
    if (_initialized) return;

    // Android settings
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS settings
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _plugin.initialize(settings);

    // Create notification channel for Android
    await _createNotificationChannel();

    // Android 13+: minta izin notifikasi runtime (no-op di versi < 13).
    if (!kIsWeb && Platform.isAndroid) {
      final androidPlugin = _plugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      await androidPlugin?.requestNotificationsPermission();
    }

    _initialized = true;
  }

  Future<void> _createNotificationChannel() async {
    final androidPlugin = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    if (androidPlugin != null) {
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          _channelId,
          _channelName,
          description: _channelDesc,
          importance: Importance.low,
          enableVibration: false,
          playSound: false,
        ),
      );
    }
  }

  /// Tampilkan notifikasi progress download.
  /// [episodeId] digunakan sebagai notifikasi ID agar update in-place.
  Future<void> showProgress({
    required int episodeId,
    required String comicTitle,
    required String episodeTitle,
    required int current,
    required int total,
  }) async {
    if (!_initialized) await init();

    final progress = total > 0 ? (current / total * 100).toInt() : 0;
    final body = total > 0
        ? '$episodeTitle — $current/$total halaman ($progress%)'
        : episodeTitle;

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDesc,
      importance: Importance.low,
      priority: Priority.low,
      ongoing: true,
      showProgress: true,
      maxProgress: total,
      progress: current,
      onlyAlertOnce: true,
      icon: '@mipmap/ic_launcher',
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(
        presentAlert: false,
        presentBadge: false,
        presentSound: false,
      ),
    );

    await _plugin.show(
      episodeId,
      '⬇ Download: $comicTitle',
      body,
      details,
    );
  }

  /// Tampilkan notifikasi selesai.
  Future<void> showComplete({
    required int episodeId,
    required String comicTitle,
    required String episodeTitle,
    required int totalPages,
  }) async {
    if (!_initialized) await init();

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDesc,
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      ongoing: false,
      autoCancel: true,
      icon: '@mipmap/ic_launcher',
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(),
    );

    await _plugin.show(
      episodeId,
      '✅ Download Selesai',
      '$comicTitle — $episodeTitle ($totalPages halaman)',
      details,
    );
  }

  /// Tampilkan notifikasi error.
  Future<void> showError({
    required int episodeId,
    required String comicTitle,
    required String episodeTitle,
    required String error,
  }) async {
    if (!_initialized) await init();

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDesc,
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      ongoing: false,
      autoCancel: true,
      icon: '@mipmap/ic_launcher',
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(),
    );

    await _plugin.show(
      episodeId + 100000, // offset agar tidak bentrok dengan progress
      '❌ Download Gagal',
      '$comicTitle — $episodeTitle: $error',
      details,
    );
  }

  /// Tampilkan notifikasi progress batch download.
  /// [batchId] digunakan sebagai notifikasi ID agar update in-place.
  Future<void> showBatchProgress({
    required int batchId,
    required String comicTitle,
    required int current,
    required int total,
    required String episodeTitle,
  }) async {
    if (!_initialized) await init();

    final progress = total > 0 ? (current / total * 100).toInt() : 0;
    final body = total > 0
        ? 'Episode $current/$total ($progress%)'
        : 'Mendownload...';

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDesc,
      importance: Importance.low,
      priority: Priority.low,
      ongoing: true,
      showProgress: true,
      maxProgress: total,
      progress: current,
      onlyAlertOnce: true,
      icon: '@mipmap/ic_launcher',
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(
        presentAlert: false,
        presentBadge: false,
        presentSound: false,
      ),
    );

    await _plugin.show(
      batchId,
      '⬇ Batch Download: $comicTitle',
      body,
      details,
    );
  }

  /// Tampilkan notifikasi selesai batch download.
  Future<void> showBatchComplete({
    required int batchId,
    required String comicTitle,
    required int downloadedCount,
    required int totalCount,
  }) async {
    if (!_initialized) await init();

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDesc,
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      ongoing: false,
      autoCancel: true,
      icon: '@mipmap/ic_launcher',
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(),
    );

    final message = downloadedCount == totalCount
        ? 'Semua $totalCount episode berhasil didownload!'
        : '$downloadedCount dari $totalCount episode berhasil didownload.';

    await _plugin.show(
      batchId,
      '✅ Batch Download Selesai',
      '$comicTitle — $message',
      details,
    );
  }

  /// Batalkan notifikasi tertentu.
  Future<void> cancel(int episodeId) async {
    await _plugin.cancel(episodeId);
  }

  /// Batalkan semua notifikasi download.
  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }
}
