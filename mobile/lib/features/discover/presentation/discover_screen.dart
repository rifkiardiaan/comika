import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../models/comic.dart';
import '../data/discover_repository.dart';
import '../../home/widgets/comic_card.dart';
import '../../comic/presentation/comic_detail_screen.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  final _repo = DiscoverRepository();
  late Future<List<Comic>> _comics;
  List<({String slug, String name})> _genres = const [];
  String? _activeGenre;
  String _sort = 'popular';

  static const _sorts = [
    ('popular', 'Terpopuler'),
    ('rating', 'Rating'),
    ('newest', 'Terbaru'),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _comics = _repo.fetchAll(genre: _activeGenre, sort: _sort);
    _repo.fetchGenres().then((g) {
      if (mounted) setState(() => _genres = g);
    }).catchError((_) {});
  }

  void _setGenre(String? slug) {
    setState(() {
      _activeGenre = _activeGenre == slug ? null : slug;
      _load();
    });
  }

  void _setSort(String sort) {
    setState(() {
      _sort = sort;
      _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Jelajahi',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 20)),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(_load);
          await _comics;
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: SizedBox(
                  height: 36,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _genreChip('Semua', null),
                      for (final g in _genres) _genreChip(g.name, g.slug),
                    ],
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    const Icon(Icons.tune, size: 16, color: Colors.grey),
                    for (final (value, label) in _sorts)
                      ChoiceChip(
                        label: Text(label, style: const TextStyle(fontSize: 12)),
                        selected: _sort == value,
                        onSelected: (_) => _setSort(value),
                      ),
                  ],
                ),
              ),
            ),
            FutureBuilder<List<Comic>>(
              future: _comics,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                if (snapshot.hasError) {
                  return SliverFillRemaining(
                    child: _ErrorView(
                      message: snapshot.error.toString(),
                      onRetry: () => setState(_load),
                    ),
                  );
                }
                final comics = snapshot.data ?? [];
                if (comics.isEmpty) {
                  return const SliverFillRemaining(
                    child: Center(child: Text('Tidak ada komik di kategori ini.')),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.52,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => GestureDetector(
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ComicDetailScreen(comicId: comics[index].id),
                          ),
                        ),
                        child: ComicCard(comic: comics[index]),
                      ),
                      childCount: comics.length,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _genreChip(String label, String? slug) {
    final active = _activeGenre == slug;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: active,
        selectedColor: AppTheme.brand,
        backgroundColor: AppTheme.surfaceLight,
        labelStyle: TextStyle(
          color: active ? Colors.white : Colors.grey.shade300,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
        side: BorderSide.none,
        onSelected: (_) => _setGenre(slug),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            const Text('Tidak dapat memuat komik'),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
            const SizedBox(height: 16),
            FilledButton(onPressed: onRetry, child: const Text('Coba Lagi')),
          ],
        ),
      ),
    );
  }
}
