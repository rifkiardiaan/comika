import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/constants/api_constants.dart';
import '../models/downloaded_episode.dart';
import '../models/episode.dart';
import 'api_service.dart';
import 'download_notification_service.dart';

/// Service untuk download episode komik ke storage lokal & membaca offline.
class DownloadService {
  DownloadService._();
  static final DownloadService instance = DownloadService._();

  static const _prefsKey = 'comika_downloads';
  final ApiService _api = ApiService.instance;

  // ────────── Persistence ──────────

  Future<List<DownloadedEpisode>> getAll() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw == null || raw.isEmpty) return [];
    return DownloadedEpisode.decodeList(raw);
  }

  Future<void> _saveAll(List<DownloadedEpisode> items) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, DownloadedEpisode.encodeList(items));
  }

  /// Cek apakah episode sudah didownload.
  Future<bool> isDownloaded(int episodeId) async {
    final items = await getAll();
    return items.any((e) => e.episodeId == episodeId);
  }

  // ────────── Download ──────────

  /// Download seluruh halaman episode ke local storage.
  /// Shows system notification progress if [showNotification] is true.
  Future<DownloadedEpisode> downloadEpisode({
    required EpisodeDetail detail,
    required String? comicTitle,
    required String? comicCoverUrl,
    void Function(double progress)? onProgress,
    bool showNotification = true,
  }) async {
    final episode = detail.episode;
    final dir = await _getEpisodeDir(episode.comicId, episode.id);

    // Bersihkan folder lama jika ada
    if (await dir.exists()) {
      await dir.delete(recursive: true);
    }
    await dir.create(recursive: true);

    final List<String> localPaths = [];
    int totalBytes = 0;
    final totalPages = detail.pages.length;
    final notifier = DownloadNotificationService.instance;

    for (int i = 0; i < totalPages; i++) {
      final page = detail.pages[i];
      final imageUrl = ApiConstants.assetUrl(page.imageUrl);
      if (imageUrl.isEmpty) continue;

      try {
        final response = await _api.downloadImage(imageUrl);
        final fileName = 'page_${page.pageNumber.toString().padLeft(3, '0')}.jpg';
        final file = File('${dir.path}/$fileName');
        await file.writeAsBytes(response);
        localPaths.add(file.path);
        totalBytes += response.length;
      } catch (_) {
        // Skip halaman yang gagal di-download
      }

      final progress = (i + 1) / totalPages;
      onProgress?.call(progress);

      // Update system notification progress setiap 2 halaman atau halaman terakhir
      if (showNotification && (i % 2 == 0 || i == totalPages - 1)) {
        await notifier.showProgress(
          episodeId: episode.id,
          comicTitle: comicTitle ?? 'Komik',
          episodeTitle: episode.title,
          current: i + 1,
          total: totalPages,
        );
      }
    }

    final downloaded = DownloadedEpisode(
      episodeId: episode.id,
      comicId: episode.comicId,
      comicTitle: comicTitle ?? '',
      comicCoverUrl: comicCoverUrl,
      episodeTitle: episode.title,
      episodeNumber: episode.number,
      pageCount: localPaths.length,
      downloadedAt: DateTime.now(),
      localPagePaths: localPaths,
      totalSizeBytes: totalBytes,
      localCoverPath: await _downloadCover(comicCoverUrl, episode.comicId),
    );

    // Update prefs
    final items = await getAll();
    items.removeWhere((e) => e.episodeId == episode.id);
    items.insert(0, downloaded);
    await _saveAll(items);

    // Tampilkan notifikasi selesai
    if (showNotification && localPaths.isNotEmpty) {
      await notifier.showComplete(
        episodeId: episode.id,
        comicTitle: comicTitle ?? 'Komik',
        episodeTitle: episode.title,
        totalPages: localPaths.length,
      );
    }

    return downloaded;
  }

  // ────────── Batch Download ──────────

  /// Download semua episode yang belum didownload.
  /// Returns jumlah episode yang berhasil didownload.
  /// Menampilkan notifikasi system-level untuk progress batch.
  Future<int> downloadAllEpisodes({
    required List<EpisodeDetail> episodes,
    required String? comicTitle,
    required String? comicCoverUrl,
    void Function(int current, int total, String episodeTitle, double overallProgress)? onProgress,
  }) async {
    final notifier = DownloadNotificationService.instance;
    int downloaded = 0;
    final total = episodes.length;
    final batchId = 999999; // Fixed ID agar notification batch update in-place

    // Tampilkan notifikasi batch dimulai
    await notifier.showBatchProgress(
      batchId: batchId,
      comicTitle: comicTitle ?? 'Komik',
      current: 0,
      total: total,
      episodeTitle: '',
    );

    for (int i = 0; i < total; i++) {
      final ep = episodes[i];
      final alreadyDone = await isDownloaded(ep.episode.id);
      if (alreadyDone) {
        // Skip tapi tetap update progress
        onProgress?.call(i + 1, total, ep.episode.title, (i + 1) / total);
        // Update batch notification
        await notifier.showBatchProgress(
          batchId: batchId,
          comicTitle: comicTitle ?? 'Komik',
          current: i + 1,
          total: total,
          episodeTitle: ep.episode.title,
        );
        continue;
      }

      try {
        await downloadEpisode(
          detail: ep,
          comicTitle: comicTitle,
          comicCoverUrl: comicCoverUrl,
          onProgress: (p) {
            // Report sub-progress as part of overall
            final overallProgress = ((i + p) / total);
            onProgress?.call(i + 1, total, ep.episode.title, overallProgress);
            // Update batch notification periodically
            if (p >= 0.5 || p == 1.0) {
              notifier.showBatchProgress(
                batchId: batchId,
                comicTitle: comicTitle ?? 'Komik',
                current: i + 1,
                total: total,
                episodeTitle: ep.episode.title,
              );
            }
          },
          showNotification: false, // Kita handle notifikasi sendiri
        );
        downloaded++;
      } catch (e) {
        debugPrint('[BatchDownload] Gagal: ${ep.episode.title} — $e');
        await notifier.showError(
          episodeId: ep.episode.id,
          comicTitle: comicTitle ?? 'Komik',
          episodeTitle: ep.episode.title,
          error: e.toString(),
        );
      }
    }

    // Tampilkan notifikasi selesai
    await notifier.showBatchComplete(
      batchId: batchId,
      comicTitle: comicTitle ?? 'Komik',
      downloadedCount: downloaded,
      totalCount: total,
    );

    return downloaded;
  }

  // ────────── Delete ──────────

  /// Hapus download episode.
  Future<void> deleteEpisode(int episodeId) async {
    final items = await getAll();
    final target = items.firstWhere(
      (e) => e.episodeId == episodeId,
      orElse: () => DownloadedEpisode(
        episodeId: 0, comicId: 0, comicTitle: '', episodeTitle: '',
        episodeNumber: 0, pageCount: 0, downloadedAt: DateTime.now(),
        localPagePaths: [], totalSizeBytes: 0,
      ),
    );

    if (target.episodeId != 0) {
      // Hapus file fisik
      final dir = await _getEpisodeDir(target.comicId, episodeId);
      if (await dir.exists()) {
        await dir.delete(recursive: true);
      }
      items.removeWhere((e) => e.episodeId == episodeId);
      await _saveAll(items);

      // Hapus folder komik (termasuk cover) bila tidak ada episode tersisa
      final remaining = items.any((e) => e.comicId == target.comicId);
      if (!remaining) {
        final comicDir = await _getComicDir(target.comicId);
        if (await comicDir.exists()) {
          await comicDir.delete(recursive: true);
        }
      }
    }
  }

  /// Hapus semua download.
  Future<void> deleteAll() async {
    final dlDir = await _getDownloadRoot();
    if (await dlDir.exists()) {
      await dlDir.delete(recursive: true);
    }
    await _saveAll([]);
  }

  /// Total ukuran semua download (bytes).
  Future<int> totalSizeBytes() async {
    final items = await getAll();
    int total = 0;
    for (final item in items) {
      total += item.totalSizeBytes;
    }
    return total;
  }

  /// Human-readable total size.
  Future<String> totalSizeLabel() async {
    final bytes = await totalSizeBytes();
    if (bytes < 1024) return '${bytes}B';
    if (bytes < 1048576) return '${(bytes / 1024).toStringAsFixed(1)}KB';
    if (bytes < 1073741824) return '${(bytes / 1048576).toStringAsFixed(1)}MB';
    return '${(bytes / 1073741824).toStringAsFixed(2)}GB';
  }

  /// Jumlah episode yang didownload.
  Future<int> episodeCount() async {
    final items = await getAll();
    return items.length;
  }

  /// Jumlah komik unik yang didownload.
  Future<int> comicCount() async {
    final items = await getAll();
    final comicIds = items.map((e) => e.comicId).toSet();
    return comicIds.length;
  }

  /// Download episode dengan progress notification.
  /// Shows both system notification and callback progress.
  Future<DownloadedEpisode> downloadWithNotification({
    required EpisodeDetail detail,
    required String? comicTitle,
    required String? comicCoverUrl,
    void Function(int current, int total, double progress)? onProgress,
  }) async {
    return downloadEpisode(
      detail: detail,
      comicTitle: comicTitle,
      comicCoverUrl: comicCoverUrl,
      showNotification: true,
      onProgress: (progress) {
        final totalPages = detail.pages.length;
        final current = (progress * totalPages).ceil();
        onProgress?.call(current, totalPages, progress);
      },
    );
  }

  // ────────── Helpers ──────────

  Future<Directory> _getDownloadRoot() async {
    final appDir = await getApplicationDocumentsDirectory();
    return Directory('${appDir.path}/comika_downloads');
  }

  Future<Directory> _getEpisodeDir(int comicId, int episodeId) async {
    final root = await _getDownloadRoot();
    return Directory('${root.path}/comic_${comicId}_eps_$episodeId');
  }

  Future<Directory> _getComicDir(int comicId) async {
    final root = await _getDownloadRoot();
    return Directory('${root.path}/comic_$comicId');
  }

  /// Download cover komik ke local storage — dipakai thumbnail di Komik Offline.
  /// Disimpan sekali per komik (`comic_<id>/cover.jpg`) agar hemat bandwith.
  /// Best-effort: return null bila gagal agar download episode tidak terblokir.
  Future<String?> _downloadCover(String? coverUrl, int comicId) async {
    if (coverUrl == null || coverUrl.isEmpty) return null;
    final url = ApiConstants.assetUrl(coverUrl);
    if (url.isEmpty) return null;

    try {
      final dir = await _getComicDir(comicId);
      if (!await dir.exists()) {
        await dir.create(recursive: true);
      }
      final file = File('${dir.path}/cover.jpg');
      // Sudah pernah didownload — pakai yang ada
      if (await file.exists()) return file.path;
      final bytes = await _api.downloadImage(url);
      await file.writeAsBytes(bytes);
      return file.path;
    } catch (_) {
      return null;
    }
  }
}
