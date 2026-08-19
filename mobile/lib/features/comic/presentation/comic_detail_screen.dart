import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/comic.dart';
import '../../../models/episode.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../data/comic_detail_repository.dart';
import '../../reader/presentation/reader_screen.dart';

class ComicDetailScreen extends StatefulWidget {
  final int comicId;

  const ComicDetailScreen({super.key, required this.comicId});

  @override
  State<ComicDetailScreen> createState() => _ComicDetailScreenState();
}

class _ComicDetailScreenState extends State<ComicDetailScreen> {
  final _repo = ComicDetailRepository();
  late Future<ComicDetail> _future;

  bool _bookmarked = false;
  bool _followed = false;
  bool _liked = false;
  int _likeCount = 0;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<ComicDetail> _load() async {
    final detail = await _repo.fetch(widget.comicId);
    _bookmarked = detail.isBookmarked;
    _followed = detail.isFollowed;
    _liked = detail.isLiked;
    _likeCount = detail.likeCount > 0 ? detail.likeCount : detail.comic.likeCount;
    return detail;
  }

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _toggle(Future<void> Function() action) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<ComicDetail>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
                    const SizedBox(height: 12),
                    Text(snapshot.error.toString(), textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: _reload, child: const Text('Coba Lagi')),
                  ],
                ),
              ),
            );
          }

          final detail = snapshot.data!;
          final comic = detail.comic;
          final firstReadable = detail.episodes.firstWhere(
            (e) => !e.isPremium,
            orElse: () => detail.episodes.isNotEmpty ? detail.episodes.first : _dummyEpisode(comic.id),
          );

          return CustomScrollView(
            slivers: [
              // Header dengan cover + info
              SliverAppBar(
                expandedHeight: 420,
                pinned: true,
                backgroundColor: AppTheme.background,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: _Header(comic: comic),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Genre chips
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final g in comic.genres)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.brand.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(g, style: const TextStyle(color: Color(0xFFC4B5FD), fontSize: 11, fontWeight: FontWeight.w600)),
                            ),
                          _statusChip(comic.status),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text(comic.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      Text('oleh ${comic.creatorName}', style: TextStyle(color: Colors.grey.shade400, fontSize: 13)),
                      const SizedBox(height: 12),
                      Text(comic.synopsis, style: TextStyle(color: Colors.grey.shade300, fontSize: 13, height: 1.5)),
                      const SizedBox(height: 16),

                      // Stats
                      Row(
                        children: [
                          _stat(icon: Icons.star, color: Colors.amber, text: '${comic.ratingAvg.toStringAsFixed(1)} (${Formatters.compact(comic.ratingCount)})'),
                          const SizedBox(width: 16),
                          _stat(icon: Icons.visibility, color: Colors.grey, text: '${Formatters.compact(comic.viewCount)} dibaca'),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Actions
                      Row(
                        children: [
                          Expanded(
                            child: FilledButton.icon(
                              onPressed: () {
                                final target = detail.continueReading != null
                                    ? detail.continueReading!.episodeId
                                    : firstReadable.id;
                                _openReader(target);
                              },
                              icon: const Icon(Icons.play_arrow, size: 18),
                              label: Text(detail.continueReading != null ? 'Lanjutkan Baca' : 'Baca Sekarang'),
                              style: FilledButton.styleFrom(
                                backgroundColor: AppTheme.brand,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _actionButton(
                            icon: Icons.favorite,
                            active: _liked,
                            activeColor: Colors.pinkAccent,
                            label: Formatters.compact(_likeCount),
                            onTap: () => _toggle(() async {
                              final count = await _repo.toggleLike(comic.id);
                              setState(() {
                                _likeCount = count;
                                _liked = !_liked;
                              });
                            }),
                          ),
                          const SizedBox(width: 8),
                          _actionButton(
                            icon: Icons.bookmark,
                            active: _bookmarked,
                            activeColor: Colors.amber,
                            label: 'Simpan',
                            onTap: () => _toggle(() async {
                              final v = await _repo.toggleBookmark(comic.id);
                              setState(() => _bookmarked = v);
                            }),
                          ),
                          const SizedBox(width: 8),
                          _actionButton(
                            icon: Icons.notifications_active,
                            active: _followed,
                            activeColor: AppTheme.brand,
                            label: 'Ikuti',
                            onTap: () => _toggle(() async {
                              final v = await _repo.toggleFollow(comic.id);
                              setState(() => _followed = v);
                            }),
                          ),
                          const SizedBox(width: 8),
                          _actionButton(
                            icon: Icons.share,
                            active: false,
                            activeColor: AppTheme.brand,
                            label: 'Bagikan',
                            onTap: () => _shareComic(comic),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${comic.episodeCount} episode',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                      ),
                      const SizedBox(height: 24),
                      Text('Daftar Episode', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.grey.shade100)),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final ep = detail.episodes[index];
                      // Premium hanya dianggap terkunci bila pengunjung anonim
                      // (status unlock per episode baru diketahui di layar reader).
                      final locked = ep.isPremium && !AuthService.instance.isLoggedIn;
                      return _EpisodeTile(
                        episode: ep,
                        locked: locked,
                        onTap: () => _openReader(ep.id),
                      );
                    },
                    childCount: detail.episodes.length,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _openReader(int episodeId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ReaderScreen(comicId: widget.comicId, episodeId: episodeId),
      ),
    );
  }

  void _shareComic(Comic comic) {
    final url = 'https://comika.app/comics/${comic.id}';
    Share.share(
      'Cek komik "${comic.title}" di COMIKA! 🎨\n$url',
      subject: comic.title,
    );
  }

  Episode _dummyEpisode(int comicId) => Episode(
        id: 0,
        comicId: comicId,
        title: '',
        number: 0,
        status: 'draft',
        isPremium: false,
        priceCoin: 0,
        viewCount: 0,
        likeCount: 0,
        pageCount: 0,
      );

  Widget _statusChip(String status) {
    final label = switch (status) {
      'ongoing' => 'Ongoing',
      'completed' => 'Selesai',
      'hiatus' => 'Hiatus',
      _ => status,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  Widget _stat({required IconData icon, required Color color, required String text}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: color),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  Widget _actionButton({
    required IconData icon,
    required bool active,
    required Color activeColor,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: OutlinedButton.icon(
        onPressed: _busy ? null : onTap,
        icon: Icon(icon, size: 17, color: active ? activeColor : Colors.grey),
        label: Text(label, style: TextStyle(fontSize: 12, color: active ? activeColor : Colors.grey)),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: active ? activeColor.withValues(alpha: 0.6) : AppTheme.surfaceLight),
          backgroundColor: active ? activeColor.withValues(alpha: 0.12) : AppTheme.surfaceLight,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final Comic comic;

  const _Header({required this.comic});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.brand.withValues(alpha: 0.55),
            AppTheme.background,
          ],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 80, 16, 16),
          child: Align(
            alignment: Alignment.bottomLeft,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                  // Cover
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: _CoverImage(comic: comic),
                  ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black45,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star, size: 13, color: Colors.amber),
                            const SizedBox(width: 3),
                            Text(comic.ratingAvg.toStringAsFixed(1), style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        comic.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ],
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

/// Cover image untuk header detail komik.
class _CoverImage extends StatelessWidget {
  final Comic comic;

  const _CoverImage({required this.comic});

  @override
  Widget build(BuildContext context) {
    final url = ApiConstants.assetUrl(comic.coverUrl);
    if (url.isNotEmpty) {
      return Container(
        width: 110,
        height: 150,
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Image.network(
          url,
          width: 110,
          height: 150,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback(),
        ),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width: 110,
      height: 150,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E1B4B), Color(0xFF7C3AED)],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Center(
        child: Text(
          comic.title.isEmpty ? 'C' : comic.title.characters.first.toUpperCase(),
          style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w800, color: Colors.white70),
        ),
      ),
    );
  }
}

class _EpisodeTile extends StatelessWidget {
  final Episode episode;
  final bool locked;
  final VoidCallback onTap;

  const _EpisodeTile({required this.episode, required this.locked, required this.onTap});

  @override
  Widget build(BuildContext context) {

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: locked
                      ? const Icon(Icons.lock, size: 17, color: Colors.amber)
                      : Text('${episode.number}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(episode.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      Text(
                        '${Formatters.compact(episode.viewCount)} dibaca',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                if (episode.isPremium)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: locked ? Colors.amber.withValues(alpha: 0.15) : Colors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(locked ? Icons.lock : Icons.lock_open, size: 11, color: locked ? Colors.amber : Colors.greenAccent),
                        const SizedBox(width: 3),
                        Text(
                          locked ? '${episode.priceCoin} koin' : 'Terbuka',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: locked ? Colors.amber : Colors.greenAccent,
                          ),
                        ),
                      ],
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
