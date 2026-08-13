import '../../../core/constants/api_constants.dart';
import '../../../models/comic.dart';
import '../../../models/episode.dart';
import '../../../models/reading_history.dart';
import '../../../services/api_service.dart';

/// Repository komik — memisahkan sumber data dari UI.
class ComicRepository {
  final ApiService _api = ApiService.instance;

  Future<List<Comic>> fetchTrending({int perPage = 10}) async {
    final response = await _api.get(
      ApiConstants.comics,
      {'sort': 'popular', 'per_page': '$perPage'},
    );
    return _parseComics(response);
  }

  Future<List<Comic>> fetchComics({
    String? genre,
    String sort = 'popular',
    int page = 1,
  }) async {
    final response = await _api.get(ApiConstants.comics, {
      'genre': ?genre,
      'sort': sort,
      'page': '$page',
    });
    return _parseComics(response);
  }

  /// Opsi genre untuk filter: pasangan slug (untuk API) & nama (untuk label).
  Future<List<({String slug, String name})>> fetchGenres() async {
    final response = await _api.get(ApiConstants.genres);
    final list = response['data'] as List<dynamic>? ?? const [];
    return list
        .map((g) {
          final item = g as Map<String, dynamic>;
          return (slug: item['slug'] as String, name: item['name'] as String);
        })
        .toList();
  }

  /// Detail komik + episode + status aksi user.
  Future<ComicDetail> fetchDetail(int comicId) async {
    final response = await _api.get(ApiConstants.comic(comicId));
    final data = response['data'] as Map<String, dynamic>;

    final episodes = (data['episodes'] as List<dynamic>? ?? const [])
        .map((e) => Episode.fromJson(e as Map<String, dynamic>))
        .toList();

    final actions = data['user_actions'] as Map<String, dynamic>? ?? const {};
    final progress = data['user_progress'] as Map<String, dynamic>?;

    return ComicDetail(
      comic: Comic.fromJson(data),
      episodes: episodes,
      isBookmarked: actions['is_bookmarked'] as bool? ?? false,
      isFollowed: actions['is_followed'] as bool? ?? false,
      isLiked: actions['is_liked'] as bool? ?? false,
      likeCount: data['like_count'] as int? ?? 0,
      continueReading: progress != null ? ContinueReading.fromJson(progress) : null,
    );
  }

  Future<List<Episode>> fetchEpisodes(int comicId) async {
    final response = await _api.get(ApiConstants.episodesOf(comicId));
    final list = response['data'] as List<dynamic>? ?? const [];
    return list.map((e) => Episode.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Detail episode + halaman + navigasi prev/next.
  Future<EpisodeDetail> fetchEpisode(int episodeId) async {
    final response = await _api.get(ApiConstants.episode(episodeId));
    return EpisodeDetail.fromJson(response['data'] as Map<String, dynamic>);
  }

  // ============ Community ============

  Future<bool> toggleBookmark(int comicId) async {
    final res = await _api.post(ApiConstants.comicBookmark(comicId));
    final data = res['data'] as Map<String, dynamic>? ?? const {};
    return data['bookmarked'] as bool? ?? false;
  }

  Future<bool> toggleFollow(int comicId) async {
    final res = await _api.post(ApiConstants.comicFollow(comicId));
    final data = res['data'] as Map<String, dynamic>? ?? const {};
    return data['followed'] as bool? ?? false;
  }

  Future<int> toggleLike(int comicId) async {
    final res = await _api.post(ApiConstants.comicLike(comicId));
    final data = res['data'] as Map<String, dynamic>? ?? const {};
    return (data['like_count'] as num?)?.toInt() ?? 0;
  }

  /// Komik yang di-follow user.
  Future<List<Comic>> fetchFollows() async {
    final response = await _api.get(ApiConstants.follows);
    return _parseNestedComics(response);
  }

  /// Komik yang di-bookmark user.
  Future<List<Comic>> fetchBookmarks() async {
    final response = await _api.get(ApiConstants.bookmarks);
    return _parseNestedComics(response);
  }

  /// Riwayat baca user.
  Future<List<ReadingHistory>> fetchHistory() async {
    final response = await _api.get(ApiConstants.history);
    final list = response['data'] as List<dynamic>? ?? const [];
    return list.map((h) => ReadingHistory.fromJson(h as Map<String, dynamic>)).toList();
  }

  /// Rekam / perbarui progress baca.
  Future<void> recordProgress({
    required int episodeId,
    required int lastPage,
    double? progress,
    bool? isCompleted,
  }) async {
    await _api.post(ApiConstants.progress, {
      'episode_id': episodeId,
      'last_page': lastPage,
      'progress': ?progress,
      'is_completed': ?isCompleted,
    });
  }

  /// Unlock episode premium dengan koin (idempotent).
  Future<int> unlockEpisode(int episodeId) async {
    final res = await _api.post(ApiConstants.episodeUnlock(episodeId));
    final data = res['data'] as Map<String, dynamic>? ?? const {};
    return (data['balance'] as num?)?.toInt() ?? 0;
  }

  // ============ Helper ============

  List<Comic> _parseComics(Map<String, dynamic> response) {
    final list = response['data'] as List<dynamic>? ?? const [];
    return list
        .map((item) => Comic.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Response bookmark/follow membungkus komik di dalam item.
  List<Comic> _parseNestedComics(Map<String, dynamic> response) {
    final list = response['data'] as List<dynamic>? ?? const [];
    return list
        .map((item) {
          final comic = (item as Map<String, dynamic>)['comic'];
          return comic != null ? Comic.fromJson(comic as Map<String, dynamic>) : null;
        })
        .whereType<Comic>()
        .toList();
  }
}
