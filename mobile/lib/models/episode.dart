/// Halaman episode komik.
class EpisodePage {
  final int id;
  final int episodeId;
  final int pageNumber;
  final String imageUrl;

  const EpisodePage({
    required this.id,
    required this.episodeId,
    required this.pageNumber,
    required this.imageUrl,
  });

  factory EpisodePage.fromJson(Map<String, dynamic> json) {
    return EpisodePage(
      id: json['id'] as int,
      episodeId: json['episode_id'] as int,
      pageNumber: json['page_number'] as int? ?? 1,
      imageUrl: json['image_url'] as String? ?? '',
    );
  }
}

/// Episode komik.
class Episode {
  final int id;
  final int comicId;
  final String title;
  final int number;
  final String status;
  final bool isPremium;
  final int priceCoin;
  final int viewCount;
  final int likeCount;
  final int pageCount;
  final String? publishedAt;
  final bool isUnlocked;
  final bool isLocked;

  const Episode({
    required this.id,
    required this.comicId,
    required this.title,
    required this.number,
    required this.status,
    required this.isPremium,
    required this.priceCoin,
    required this.viewCount,
    required this.likeCount,
    required this.pageCount,
    this.publishedAt,
    this.isUnlocked = false,
    this.isLocked = false,
  });

  bool get isPublished => status == 'published';

  factory Episode.fromJson(Map<String, dynamic> json) {
    return Episode(
      id: json['id'] as int,
      comicId: json['comic_id'] as int,
      title: json['title'] as String? ?? '',
      number: json['number'] as int? ?? 0,
      status: json['status'] as String? ?? 'draft',
      isPremium: json['is_premium'] as bool? ?? false,
      priceCoin: (json['price_coin'] as num?)?.toInt() ?? 0,
      viewCount: (json['view_count'] as num?)?.toInt() ?? 0,
      likeCount: (json['like_count'] as num?)?.toInt() ?? 0,
      pageCount: (json['page_count'] as num?)?.toInt() ?? 0,
      publishedAt: json['published_at'] as String?,
      isUnlocked: json['is_unlocked'] as bool? ?? false,
      isLocked: json['is_locked'] as bool? ?? false,
    );
  }
}

/// Detail episode + halaman + navigasi prev/next.
class EpisodeDetail {
  final Episode episode;
  final List<EpisodePage> pages;
  final EpisodeNav? prev;
  final EpisodeNav? next;

  const EpisodeDetail({
    required this.episode,
    required this.pages,
    this.prev,
    this.next,
  });

  factory EpisodeDetail.fromJson(Map<String, dynamic> json) {
    return EpisodeDetail(
      episode: Episode.fromJson(json),
      pages: (json['pages'] as List<dynamic>? ?? const [])
          .map((p) => EpisodePage.fromJson(p as Map<String, dynamic>))
          .toList(),
      prev: json['prev'] != null ? EpisodeNav.fromJson(json['prev'] as Map<String, dynamic>) : null,
      next: json['next'] != null ? EpisodeNav.fromJson(json['next'] as Map<String, dynamic>) : null,
    );
  }
}

class EpisodeNav {
  final int id;
  final int number;
  final String title;

  const EpisodeNav({required this.id, required this.number, required this.title});

  factory EpisodeNav.fromJson(Map<String, dynamic> json) {
    return EpisodeNav(
      id: json['id'] as int,
      number: json['number'] as int? ?? 0,
      title: json['title'] as String? ?? '',
    );
  }
}
