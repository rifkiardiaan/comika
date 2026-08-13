import 'comic.dart';
import 'episode.dart';

/// Riwayat baca user (Lanjutkan Baca).
class ReadingHistory {
  final int id;
  final int comicId;
  final int episodeId;
  final int lastPage;
  final double progress;
  final bool isCompleted;
  final String updatedAt;
  final Comic? comic;
  final Episode? episode;

  const ReadingHistory({
    required this.id,
    required this.comicId,
    required this.episodeId,
    required this.lastPage,
    required this.progress,
    required this.isCompleted,
    required this.updatedAt,
    this.comic,
    this.episode,
  });

  factory ReadingHistory.fromJson(Map<String, dynamic> json) {
    return ReadingHistory(
      id: json['id'] as int,
      comicId: json['comic_id'] as int,
      episodeId: json['episode_id'] as int,
      lastPage: (json['last_page'] as num?)?.toInt() ?? 1,
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      isCompleted: json['is_completed'] as bool? ?? false,
      updatedAt: json['updated_at'] as String? ?? '',
      comic: json['comic'] != null ? Comic.fromJson(json['comic'] as Map<String, dynamic>) : null,
      episode: json['episode'] != null ? Episode.fromJson(json['episode'] as Map<String, dynamic>) : null,
    );
  }
}
