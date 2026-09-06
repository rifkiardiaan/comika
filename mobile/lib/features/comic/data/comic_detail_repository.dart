import '../../../models/comic.dart';
import '../../../models/episode.dart';
import '../../home/data/comic_repository.dart';

/// Repositori khusus layar Detail Komik.
class ComicDetailRepository {
  final ComicRepository _comics = ComicRepository();

  Future<ComicDetail> fetch(int comicId) => _comics.fetchDetail(comicId);

  Future<bool> toggleBookmark(int comicId) => _comics.toggleBookmark(comicId);

  Future<bool> toggleFollow(int comicId) => _comics.toggleFollow(comicId);

  Future<int> toggleLike(int comicId) => _comics.toggleLike(comicId);

  /// Fetch detail episode (untuk download offline).
  Future<EpisodeDetail> fetchEpisodeDetail(int episodeId) => _comics.fetchEpisode(episodeId);
}
