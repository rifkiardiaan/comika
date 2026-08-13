import '../../../models/episode.dart';
import '../../home/data/comic_repository.dart';

/// Repositori khusus layar Reader.
class ReaderRepository {
  final ComicRepository _comics = ComicRepository();

  Future<EpisodeDetail> fetch(int episodeId) => _comics.fetchEpisode(episodeId);

  Future<void> recordProgress({
    required int episodeId,
    required int lastPage,
    double? progress,
    bool? isCompleted,
  }) =>
      _comics.recordProgress(
        episodeId: episodeId,
        lastPage: lastPage,
        progress: progress,
        isCompleted: isCompleted,
      );

  Future<int> unlock(int episodeId) => _comics.unlockEpisode(episodeId);
}
