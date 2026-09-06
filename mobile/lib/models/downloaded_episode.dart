import 'dart:convert';

/// Metadata untuk episode yang sudah didownload untuk baca offline.
class DownloadedEpisode {
  final int episodeId;
  final int comicId;
  final String comicTitle;
  final String? comicCoverUrl;
  final String episodeTitle;
  final int episodeNumber;
  final int pageCount;
  final DateTime downloadedAt;
  final List<String> localPagePaths; // path lokal tiap halaman
  final int totalSizeBytes;

  const DownloadedEpisode({
    required this.episodeId,
    required this.comicId,
    required this.comicTitle,
    this.comicCoverUrl,
    required this.episodeTitle,
    required this.episodeNumber,
    required this.pageCount,
    required this.downloadedAt,
    required this.localPagePaths,
    required this.totalSizeBytes,
  });

  /// Komik unik berdasarkan comicId (untuk grouping di UI).
  String get comicKey => '$comicId';

  /// Human-readable size.
  String get sizeLabel {
    if (totalSizeBytes < 1024) return '${totalSizeBytes}B';
    if (totalSizeBytes < 1048576) return '${(totalSizeBytes / 1024).toStringAsFixed(1)}KB';
    return '${(totalSizeBytes / 1048576).toStringAsFixed(1)}MB';
  }

  Map<String, dynamic> toJson() => {
        'episodeId': episodeId,
        'comicId': comicId,
        'comicTitle': comicTitle,
        'comicCoverUrl': comicCoverUrl,
        'episodeTitle': episodeTitle,
        'episodeNumber': episodeNumber,
        'pageCount': pageCount,
        'downloadedAt': downloadedAt.toIso8601String(),
        'localPagePaths': localPagePaths,
        'totalSizeBytes': totalSizeBytes,
      };

  factory DownloadedEpisode.fromJson(Map<String, dynamic> json) {
    return DownloadedEpisode(
      episodeId: json['episodeId'] as int,
      comicId: json['comicId'] as int,
      comicTitle: json['comicTitle'] as String? ?? '',
      comicCoverUrl: json['comicCoverUrl'] as String?,
      episodeTitle: json['episodeTitle'] as String? ?? '',
      episodeNumber: json['episodeNumber'] as int? ?? 0,
      pageCount: json['pageCount'] as int? ?? 0,
      downloadedAt: DateTime.tryParse(json['downloadedAt'] as String? ?? '') ?? DateTime.now(),
      localPagePaths: (json['localPagePaths'] as List<dynamic>? ?? const []).cast<String>(),
      totalSizeBytes: json['totalSizeBytes'] as int? ?? 0,
    );
  }

  /// Encode list ke JSON string untuk disimpan di SharedPreferences.
  static String encodeList(List<DownloadedEpisode> items) =>
      jsonEncode(items.map((e) => e.toJson()).toList());

  /// Decode JSON string ke list DownloadedEpisode.
  static List<DownloadedEpisode> decodeList(String source) {
    final list = jsonDecode(source) as List<dynamic>;
    return list.map((e) => DownloadedEpisode.fromJson(e as Map<String, dynamic>)).toList();
  }
}
