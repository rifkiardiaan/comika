import 'dart:io';

import 'package:flutter/material.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/downloaded_episode.dart';
import '../../../services/download_service.dart';
import '../../comic/presentation/comic_detail_screen.dart';
import '../../reader/presentation/reader_screen.dart';

/// Halaman Komik Tersimpan — menampilkan SEMUA komik yang sudah didownload offline.
/// Data diambil dari local storage (SharedPreferences), sehingga bisa diakses
/// tanpa koneksi internet.
class SavedComicsScreen extends StatefulWidget {
  const SavedComicsScreen({super.key});

  @override
  State<SavedComicsScreen> createState() => _SavedComicsScreenState();
}

class _SavedComicsScreenState extends State<SavedComicsScreen> {
  List<DownloadedEpisode> _downloads = [];
  bool _loading = true;
  String _totalSize = '0KB';
  int _comicCount = 0;
  int _episodeCount = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    final items = await DownloadService.instance.getAll();
    // Verify files still exist
    final valid = <DownloadedEpisode>[];
    for (final item in items) {
      if (item.localPagePaths.isNotEmpty && await File(item.localPagePaths.first).exists()) {
        valid.add(item);
      }
    }
    final totalSize = await DownloadService.instance.totalSizeLabel();
    final comicCount = valid.map((e) => e.comicId).toSet().length;
    if (mounted) {
      setState(() {
        _downloads = valid;
        _totalSize = totalSize;
        _comicCount = comicCount;
        _episodeCount = valid.length;
        _loading = false;
      });
    }
  }

  /// Group by comicId.
  Map<int, List<DownloadedEpisode>> get _grouped {
    final map = <int, List<DownloadedEpisode>>{};
    for (final d in _downloads) {
      map.putIfAbsent(d.comicId, () => []).add(d);
    }
    return map;
  }

  Future<void> _deleteEpisode(DownloadedEpisode item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Download'),
        content: Text('Hapus "${item.episodeTitle}" dari offline?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Batal')),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await DownloadService.instance.deleteEpisode(item.episodeId);
    _load();
  }

  Future<void> _deleteAll() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Semua Download'),
        content: const Text('Semua episode offline akan dihapus. Yakin?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Batal')),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Hapus Semua'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await DownloadService.instance.deleteAll();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Komik Tersimpan', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          if (_downloads.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep, color: Colors.redAccent),
              tooltip: 'Hapus semua',
              onPressed: _deleteAll,
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _downloads.isEmpty
              ? _buildEmpty()
              : _buildContent(),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.surfaceLight,
                borderRadius: BorderRadius.circular(22),
              ),
              child: const Icon(Icons.bookmark_border, size: 40, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            const Text('Belum ada komik tersimpan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(
              'Download episode komik untuk dibaca tanpa internet.\nTap ikon ⬇ di halaman episode.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    final grouped = _grouped;
    final comicIds = grouped.keys.toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Storage summary card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppTheme.brand.withValues(alpha: 0.2), AppTheme.surface],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.brand.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppTheme.brand.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.cloud_done, size: 26, color: AppTheme.brand),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Komik Tersimpan Offline', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        '$_totalSize · $_comicCount komik · $_episodeCount episode',
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Section title
          Text(
            'Semua Komik ($_comicCount)',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.grey.shade100),
          ),
          const SizedBox(height: 12),

          // Comic cards
          for (int i = 0; i < comicIds.length; i++)
            _SavedComicCard(
              episodes: grouped[comicIds[i]]!,
              onDeleteEpisode: _deleteEpisode,
              onOpenComic: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ComicDetailScreen(comicId: comicIds[i]),
                ),
              ),
              onReadEpisode: (ep) => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ReaderScreen(comicId: ep.comicId, episodeId: ep.episodeId),
                ),
              ),
            ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

/// Card komik yang sudah didownload — cover, judul, daftar episode offline.
class _SavedComicCard extends StatelessWidget {
  final List<DownloadedEpisode> episodes;
  final Future<void> Function(DownloadedEpisode) onDeleteEpisode;
  final VoidCallback onOpenComic;
  final void Function(DownloadedEpisode) onReadEpisode;

  const _SavedComicCard({
    required this.episodes,
    required this.onDeleteEpisode,
    required this.onOpenComic,
    required this.onReadEpisode,
  });

  @override
  Widget build(BuildContext context) {
    // Sort by episode number
    final sorted = List<DownloadedEpisode>.from(episodes)
      ..sort((a, b) => a.episodeNumber.compareTo(b.episodeNumber));

    final first = sorted.first;
    final totalSize = sorted.fold<int>(0, (sum, e) => sum + e.totalSizeBytes);
    final sizeLabel = totalSize < 1048576
        ? '${(totalSize / 1024).toStringAsFixed(0)}KB'
        : '${(totalSize / 1048576).toStringAsFixed(1)}MB';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.surfaceLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Comic header with cover
          InkWell(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            onTap: onOpenComic,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  // Cover thumbnail
                  _SavedCoverThumb(coverUrl: first.comicCoverUrl, title: first.comicTitle),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          first.comicTitle.isEmpty ? 'Komik #${first.comicId}' : first.comicTitle,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            _infoChip(
                              icon: Icons.book_outlined,
                              label: '${sorted.length} episode',
                            ),
                            const SizedBox(width: 8),
                            _infoChip(
                              icon: Icons.storage,
                              label: sizeLabel,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.grey, size: 22),
                ],
              ),
            ),
          ),

          // Divider
          Divider(height: 1, color: Colors.grey.shade900),

          // Episode list
          for (final ep in sorted)
            _SavedEpisodeTile(
              episode: ep,
              onDelete: () => onDeleteEpisode(ep),
              onTap: () => onReadEpisode(ep),
            ),
        ],
      ),
    );
  }

  Widget _infoChip({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Colors.grey.shade400),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade400, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

/// Episode tile untuk halaman komik tersimpan.
class _SavedEpisodeTile extends StatelessWidget {
  final DownloadedEpisode episode;
  final VoidCallback onDelete;
  final VoidCallback onTap;

  const _SavedEpisodeTile({
    required this.episode,
    required this.onDelete,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppTheme.brand.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${episode.episodeNumber}',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppTheme.brand),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      episode.episodeTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${episode.pageCount} halaman · ${episode.sizeLabel}',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                    ),
                  ],
                ),
              ),
              // Read button
              IconButton(
                icon: const Icon(Icons.play_circle, color: AppTheme.brand, size: 24),
                onPressed: onTap,
                visualDensity: VisualDensity.compact,
                tooltip: 'Baca',
              ),
              // Delete button
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                onPressed: onDelete,
                visualDensity: VisualDensity.compact,
                tooltip: 'Hapus',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Cover thumbnail untuk saved comics screen.
class _SavedCoverThumb extends StatelessWidget {
  final String? coverUrl;
  final String title;

  const _SavedCoverThumb({required this.coverUrl, required this.title});

  @override
  Widget build(BuildContext context) {
    final url = ApiConstants.assetUrl(coverUrl);
    if (url.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          url,
          width: 52,
          height: 72,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback(),
        ),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width: 52,
      height: 72,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E1B4B), Color(0xFF7C3AED)],
        ),
      ),
      child: Text(
        title.isEmpty ? 'C' : title.characters.first.toUpperCase(),
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white70),
      ),
    );
  }
}
