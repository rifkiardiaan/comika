import '../../../models/comic.dart';
import '../../home/data/comic_repository.dart';

/// Repositori khusus layar Jelajahi.
class DiscoverRepository {
  final ComicRepository _comics = ComicRepository();

  Future<List<Comic>> fetchAll({String? genre, String sort = 'popular'}) {
    return _comics.fetchComics(genre: genre, sort: sort);
  }

  Future<List<({String slug, String name})>> fetchGenres() => _comics.fetchGenres();
}
