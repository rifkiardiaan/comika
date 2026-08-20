import 'episode.dart';

/// Model Komik — disinkronkan dengan struktur API backend COMIKA.
class Comic {
  final int id;
  final String title;
  final String synopsis;
  final String? coverUrl;
  final String status;
  final double ratingAvg;
  final int ratingCount;
  final int viewCount;
  final int likeCount;
  final int creatorId;
  final String creatorName;
  final String? creatorAvatarUrl;
  final List<String> genres;
  final int episodeCount;

  const Comic({
    required this.id,
    required this.title,
    required this.synopsis,
    this.coverUrl,
    required this.status,
    required this.ratingAvg,
    required this.ratingCount,
    required this.viewCount,
    required this.likeCount,
    required this.creatorId,
    required this.creatorName,
    this.creatorAvatarUrl,
    required this.genres,
    required this.episodeCount,
  });

  factory Comic.fromJson(Map<String, dynamic> json) {
    final creator = json['creator'] as Map<String, dynamic>? ?? const {};
    final genreList = (json['genres'] as List<dynamic>? ?? const [])
        .map((g) => (g as Map<String, dynamic>)['name'] as String)
        .toList();

    return Comic(
      id: json['id'] as int,
      title: json['title'] as String,
      synopsis: json['synopsis'] as String? ?? '',
      coverUrl: json['cover_url'] as String?,
      status: json['status'] as String? ?? 'ongoing',
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 0,
      ratingCount: json['rating_count'] as int? ?? 0,
      viewCount: json['view_count'] as int? ?? 0,
      likeCount: json['like_count'] as int? ?? 0,
      creatorId: (creator['id'] as num?)?.toInt() ?? 0,
      creatorName: creator['name'] as String? ?? '',
      creatorAvatarUrl: creator['avatar_url'] as String?,
      genres: genreList,
      episodeCount: json['episode_count'] as int? ?? 0,
    );
  }
}

/// Detail komik + episode + aksi user (saat login).
class ComicDetail {
  final Comic comic;
  final List<Episode> episodes;
  final bool isBookmarked;
  final bool isFollowed;
  final bool isLiked;
  final int likeCount;
  final ContinueReading? continueReading;

  const ComicDetail({
    required this.comic,
    required this.episodes,
    this.isBookmarked = false,
    this.isFollowed = false,
    this.isLiked = false,
    this.likeCount = 0,
    this.continueReading,
  });
}

/// Info "Lanjutkan Baca" dari progress terakhir user.
class ContinueReading {
  final int episodeId;
  final int episodeNumber;
  final String episodeTitle;
  final int lastPage;
  final double progress;
  final bool isCompleted;

  const ContinueReading({
    required this.episodeId,
    required this.episodeNumber,
    required this.episodeTitle,
    required this.lastPage,
    required this.progress,
    required this.isCompleted,
  });

  factory ContinueReading.fromJson(Map<String, dynamic> json) {
    return ContinueReading(
      episodeId: json['episode_id'] as int,
      episodeNumber: (json['episode_number'] as num?)?.toInt() ?? 0,
      episodeTitle: json['episode_title'] as String? ?? '',
      lastPage: (json['last_page'] as num?)?.toInt() ?? 1,
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      isCompleted: json['is_completed'] as bool? ?? false,
    );
  }
}
