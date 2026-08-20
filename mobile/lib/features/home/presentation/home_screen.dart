import 'package:flutter/material.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/comic.dart';
import '../../../models/reading_history.dart';
import '../../../services/auth_service.dart';
import '../data/comic_repository.dart';
import '../widgets/comic_card.dart';
import '../../comic/presentation/comic_detail_screen.dart';
import '../../notification/data/notification_repository.dart';
import '../../notification/presentation/notification_screen.dart';
import '../../reader/presentation/reader_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _repository = ComicRepository();
  late Future<List<Comic>> _trending;
  late Future<List<Comic>> _newReleases;
  late Future<List<ReadingHistory>> _continueReading;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _trending = _repository.fetchTrending(perPage: 10);
    _newReleases = _repository.fetchComics(sort: 'newest');
    _continueReading = _repository.fetchHistory();
  }

  void _openComic(Comic comic) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ComicDetailScreen(comicId: comic.id)),
    );
  }

  void _refresh() {
    setState(_load);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Text(
              'C',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 22,
                color: Color(0xFF8B5CF6),
              ),
            ),
            SizedBox(width: 4),
            Text('COMIKA', style: TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        actions: [
          const _NotificationBell(),
          const SizedBox(width: 12),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            _refresh();
            await Future.wait([_trending, _newReleases, _continueReading]);
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              // Continue Reading (jika login)
              if (AuthService.instance.isLoggedIn)
                _Section<ReadingHistory>(
                  title: 'Lanjutkan Baca',
                  subtitle: 'Komik yang sedang kamu baca',
                  icon: Icons.history,
                  future: _continueReading,
                  emptyText: 'Belum ada riwayat baca.',
                  itemBuilder: (item) {
                    final comic = item.comic;
                    final episode = item.episode;
                    if (comic == null) return null;
                    return GestureDetector(
                      onTap: () {
                        if (episode != null) {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ReaderScreen(
                                comicId: item.comicId,
                                episodeId: episode.id,
                              ),
                            ),
                          );
                        } else {
                          _openComic(comic);
                        }
                      },
                      child: _ContinueReadingCard(
                        comic: comic,
                        episode: episode,
                        progress: item.progress,
                      ),
                    );
                  },
                ),

              // Trending
              _Section<Comic>(
                title: 'Trending Minggu Ini',
                subtitle: 'Komik paling banyak dibaca saat ini',
                icon: Icons.trending_up,
                future: _trending,
                emptyText: 'Belum ada komik trending.',
                itemBuilder: (comic) => GestureDetector(
                  onTap: () => _openComic(comic),
                  child: ComicCard(comic: comic),
                ),
              ),

              // New Releases
              _Section<Comic>(
                title: 'Terbaru',
                subtitle: 'Komik baru yang baru saja terbit',
                icon: Icons.new_releases_outlined,
                future: _newReleases,
                emptyText: 'Belum ada komik terbaru.',
                itemBuilder: (comic) => GestureDetector(
                  onTap: () => _openComic(comic),
                  child: ComicCard(comic: comic),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

/// Section widget reusable untuk daftar komik horizontal.
class _Section<T> extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Future<List<T>> future;
  final String emptyText;
  final Widget? Function(T) itemBuilder;

  const _Section({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.future,
    required this.emptyText,
    required this.itemBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 4),
            child: Row(
              children: [
                Icon(icon, size: 18, color: AppTheme.brand),
                const SizedBox(width: 6),
                Text(
                  title,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
            child: Text(
              subtitle,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
            ),
          ),
          SizedBox(
            height: 240,
            child: FutureBuilder<List<T>>(
              future: future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Text(
                      'Gagal memuat data',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                    ),
                  );
                }
                final items = snapshot.data ?? [];
                if (items.isEmpty) {
                  return Center(
                    child: Text(
                      emptyText,
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                    ),
                  );
                }
                return ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final widget = itemBuilder(items[index]);
                    return widget ?? const SizedBox.shrink();
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// Kartu "Lanjutkan Baca" — menampilkan cover mini + judul + progress bar.
class _ContinueReadingCard extends StatelessWidget {
  final Comic comic;
  final dynamic episode;
  final double progress;

  const _ContinueReadingCard({
    required this.comic,
    this.episode,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      margin: const EdgeInsets.only(right: 0),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          // Mini cover with real image
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(14),
              bottomLeft: Radius.circular(14),
            ),
            child: _ContinueReadingCover(comic: comic),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    comic.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  if (episode != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Eps ${episode.number}: ${episode.title}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                    ),
                  ],
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(3),
                    child: LinearProgressIndicator(
                      value: (progress / 100).clamp(0, 1),
                      minHeight: 4,
                      backgroundColor: Colors.grey.shade800,
                      valueColor: const AlwaysStoppedAnimation(AppTheme.brand),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${progress.round()}%',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Cover mini untuk kartu Lanjutkan Baca — memuat gambar dari server.
class _ContinueReadingCover extends StatelessWidget {
  final Comic comic;
  const _ContinueReadingCover({required this.comic});

  @override
  Widget build(BuildContext context) {
    final url = ApiConstants.assetUrl(comic.coverUrl);
    if (url.isNotEmpty) {
      return Image.network(
        url,
        width: 80,
        height: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => _fallback(),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width: 80,
      height: double.infinity,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E1B4B), Color(0xFF7C3AED)],
        ),
      ),
      child: Text(
        comic.title.isEmpty ? 'C' : comic.title.characters.first.toUpperCase(),
        style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: Colors.white70),
      ),
    );
  }
}

/// Lonceng notifikasi dengan badge jumlah belum dibaca.
class _NotificationBell extends StatefulWidget {
  const _NotificationBell();

  @override
  State<_NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<_NotificationBell> {
  final _repo = NotificationRepository();
  int _unread = 0;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  Future<void> _refresh() async {
    if (!AuthService.instance.isLoggedIn) return;
    try {
      final count = await _repo.unreadCount();
      if (mounted) setState(() => _unread = count);
    } catch (_) {
      // abaikan — badge tetap 0 bila gagal
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          icon: const Icon(Icons.notifications_none),
          tooltip: 'Notifikasi',
          onPressed: () async {
            await Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const NotificationScreen()),
            );
            _refresh();
          },
        ),
        if (_unread > 0)
          Positioned(
            right: 4,
            top: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.all(Radius.circular(8)),
              ),
              child: Text(
                _unread > 99 ? '99+' : '$_unread',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
