import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../models/comic.dart';
import '../../../models/reading_history.dart';
import '../../home/data/comic_repository.dart';
import '../../home/widgets/comic_card.dart';
import '../../comic/presentation/comic_detail_screen.dart';
import '../../reader/presentation/reader_screen.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  final _repo = ComicRepository();
  int _tab = 0;

  late Future<List<Comic>> _follows;
  late Future<List<Comic>> _bookmarks;
  late Future<List<ReadingHistory>> _history;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _follows = _repo.fetchFollows();
    _bookmarks = _repo.fetchBookmarks();
    _history = _repo.fetchHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Perpustakaan', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 20)),
      ),
      body: Column(
        children: [
          // Tabs
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: Row(
              children: [
                _tabButton(0, 'Mengikuti', Icons.notifications_active),
                const SizedBox(width: 8),
                _tabButton(1, 'Bookmark', Icons.bookmark),
                const SizedBox(width: 8),
                _tabButton(2, 'Riwayat', Icons.history),
              ],
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                setState(_load);
                await Future.wait([_follows, _bookmarks, _history]);
              },
              child: IndexedStack(
                index: _tab,
                children: [
                  _ComicGrid(future: _follows, empty: 'Belum ada komik yang kamu ikuti.'),
                  _ComicGrid(future: _bookmarks, empty: 'Belum ada bookmark.'),
                  _HistoryList(future: _history),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabButton(int index, String label, IconData icon) {
    final active = _tab == index;
    return Expanded(
      child: Material(
        color: active ? AppTheme.brand : AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => setState(() => _tab = index),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 15, color: active ? Colors.white : Colors.grey),
                const SizedBox(width: 5),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: active ? Colors.white : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ComicGrid extends StatelessWidget {
  final Future<List<Comic>> future;
  final String empty;

  const _ComicGrid({required this.future, required this.empty});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Comic>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                snapshot.error.toString(),
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
              ),
            ),
          );
        }
        final comics = snapshot.data ?? [];
        if (comics.isEmpty) {
          return Center(child: Text(empty, style: TextStyle(color: Colors.grey.shade500, fontSize: 13)));
        }
        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.52,
          ),
          itemCount: comics.length,
          itemBuilder: (context, index) => GestureDetector(
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => ComicDetailScreen(comicId: comics[index].id)),
            ),
            child: ComicCard(comic: comics[index]),
          ),
        );
      },
    );
  }
}

class _HistoryList extends StatelessWidget {
  final Future<List<ReadingHistory>> future;

  const _HistoryList({required this.future});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<ReadingHistory>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(
            child: Text(snapshot.error.toString(), style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
          );
        }
        final items = snapshot.data ?? [];
        if (items.isEmpty) {
          return Center(
            child: Text('Belum ada riwayat baca.', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            final comic = item.comic;
            final episode = item.episode;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Material(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(14),
                child: InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: () {
                    if (comic != null) {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => ComicDetailScreen(comicId: comic.id)),
                      );
                    }
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 64,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFF1E1B4B), Color(0xFF7C3AED)]),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            (comic?.title.isNotEmpty ?? false) ? comic!.title.characters.first.toUpperCase() : 'C',
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white70),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                comic?.title ?? '—',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                episode != null ? 'Eps ${episode.number}: ${episode.title}' : '—',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                              ),
                              const SizedBox(height: 8),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: (item.progress / 100).clamp(0, 1),
                                  minHeight: 4,
                                  backgroundColor: Colors.grey.shade900,
                                  valueColor: const AlwaysStoppedAnimation(AppTheme.brand),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (episode != null)
                          IconButton(
                            icon: const Icon(Icons.play_circle, color: AppTheme.brand, size: 26),
                            onPressed: () {
                              final comicId = item.comicId;
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ReaderScreen(comicId: comicId, episodeId: episode.id),
                                ),
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
