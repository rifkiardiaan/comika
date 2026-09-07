import 'dart:io';

import 'package:flutter/material.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/upgrade_ad_banner.dart';
import '../../../models/downloaded_episode.dart';
import '../../../services/auth_service.dart';
import '../../../services/download_service.dart';
import '../../comic/presentation/comic_detail_screen.dart';
import '../../reader/presentation/reader_screen.dart';

/// Layar Download — menampilkan episode yang sudah didownload untuk baca offline.
/// Diakses dari dropdown menu Profil.
class DownloadsScreen extends StatefulWidget {
  const DownloadsScreen({super.key});

  @override
  State<DownloadsScreen> createState() => _DownloadsScreenState();
}

class _DownloadsScreenState extends State<DownloadsScreen> {
  List<DownloadedEpisode> _downloads = [];
  bool _loading = true;
  String _totalSize = '0KB';
  int _comicCount = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final items = await DownloadService.instance.getAll();
    // Verify files still exist
    final valid = <DownloadedEpisode>[];
    for (final item in items) {
      final exists = item.localPagePaths.isNotEmpty &&
          await File(item.localPagePaths.first).exists();
      if (exists) valid.add(item);
    }
    final totalSize = await DownloadService.instance.totalSizeLabel();
    final comicCount = valid.map((e) => e.comicId).toSet().length;
    if (mounted) {
      setState(() {
        _downloads = valid;
        _totalSize = totalSize;
        _comicCount = comicCount;
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

  /// Iklan hanya untuk akun non-premium & non-vvip (sama seperti di web).
  bool get _showAds {
    final user = AuthService.instance.user;
    return !(user?.isPremium ?? false) && !(user?.isVvip ?? false);
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
        title: const Text('Download Offline', style: TextStyle(fontWeight: FontWeight.w700)),
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
              : _buildListWithStats(),
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
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppTheme.surfaceLight,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.bookmark_border, size: 36, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            const Text('Belum ada download', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Text(
              'Download episode komik untuk dibaca tanpa internet',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Text(
              'Tap ikon ⬇ di halaman episode atau reader',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListWithStats() {
    final grouped = _grouped;
    final comicIds = grouped.keys.toList();
    final totalEpisodes = _downloads.length;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Storage usage card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.surfaceLight),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppTheme.brand.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.storage, size: 24, color: AppTheme.brand),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Penyimpanan Offline', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        '$_totalSize · $_comicCount komik · $totalEpisodes episode',
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Iklan banner offline (non-premium/non-vvip)
          if (_showAds) ...[
            const UpgradeAdBanner(full: false),
            const SizedBox(height: 8),
          ],
          // Comic groups
          for (int index = 0; index < comicIds.length; index++)
            _ComicGroup(
              comicId: comicIds[index],
              comicTitle: grouped[comicIds[index]]!.first.comicTitle,
              comicCoverUrl: grouped[comicIds[index]]!.first.comicCoverUrl,
              episodes: grouped[comicIds[index]]!,
              onDelete: _deleteEpisode,
            ),
        ],
      ),
    );
  }
}

/// Group card: satu komik + daftar episode yang didownload.
class _ComicGroup extends StatelessWidget {
  final int comicId;
  final String comicTitle;
  final String? comicCoverUrl;
  final List<DownloadedEpisode> episodes;
  final Future<void> Function(DownloadedEpisode) onDelete;

  const _ComicGroup({
    required this.comicId,
    required this.comicTitle,
    required this.comicCoverUrl,
    required this.episodes,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    // Sort by episode number
    final sorted = List<DownloadedEpisode>.from(episodes)
      ..sort((a, b) => a.episodeNumber.compareTo(b.episodeNumber));

    final totalSize = sorted.fold<int>(0, (sum, e) => sum + e.totalSizeBytes);
    final sizeLabel = totalSize < 1048576
        ? '${(totalSize / 1024).toStringAsFixed(0)}KB'
        : '${(totalSize / 1048576).toStringAsFixed(1)}MB';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.surfaceLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header komik
          InkWell(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => ComicDetailScreen(comicId: comicId)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  // Cover thumbnail
                  _CoverThumb(
                    coverUrl: comicCoverUrl,
                    localCoverPath: episodes.first.localCoverPath,
                    title: comicTitle,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          comicTitle.isEmpty ? 'Komik #$comicId' : comicTitle,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${episodes.length} episode · $sizeLabel',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
                ],
              ),
            ),
          ),
          // Divider
          Divider(height: 1, color: Colors.grey.shade900),
          // Episode list
          for (final ep in sorted)
            _DownloadedEpisodeTile(
              episode: ep,
              onDelete: () => onDelete(ep),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ReaderScreen(comicId: ep.comicId, episodeId: ep.episodeId),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _CoverThumb extends StatelessWidget {
  final String? coverUrl;
  final String? localCoverPath;
  final String title;

  const _CoverThumb({required this.coverUrl, this.localCoverPath, required this.title});

  @override
  Widget build(BuildContext context) {
    final local = localCoverPath ?? '';
    if (local.isNotEmpty && File(local).existsSync()) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.file(
          File(local),
          width: 48,
          height: 64,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback(),
        ),
      );
    }
    final url = ApiConstants.assetUrl(coverUrl);
    if (url.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.network(
          url,
          width: 48,
          height: 64,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback(),
        ),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width: 48,
      height: 64,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: const LinearGradient(colors: [Color(0xFF1E1B4B), Color(0xFF7C3AED)]),
      ),
      child: Text(
        title.isEmpty ? 'C' : title.characters.first.toUpperCase(),
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white70),
      ),
    );
  }
}

class _DownloadedEpisodeTile extends StatelessWidget {
  final DownloadedEpisode episode;
  final VoidCallback onDelete;
  final VoidCallback onTap;

  const _DownloadedEpisodeTile({
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
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppTheme.brand.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${episode.episodeNumber}',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppTheme.brand),
                ),
              ),
              const SizedBox(width: 10),
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
              IconButton(
                icon: const Icon(Icons.play_circle, color: AppTheme.brand, size: 22),
                onPressed: onTap,
                visualDensity: VisualDensity.compact,
                tooltip: 'Baca',
              ),
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
