import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/upgrade_ad_banner.dart';
import '../../../models/episode.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../../../services/download_service.dart';
import '../../comic/data/comic_detail_repository.dart';
import '../data/reader_repository.dart';

/// Reader webtoon vertikal — halaman penuh, scroll vertikal.
class ReaderScreen extends StatefulWidget {
  final int comicId;
  final int episodeId;

  const ReaderScreen({super.key, required this.comicId, required this.episodeId});

  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  final _repo = ReaderRepository();
  final _scrollController = ScrollController();

  EpisodeDetail? _detail;
  bool _loading = true;
  String? _error;
  bool _unlocking = false;
  double _progress = 0;
  bool _isDownloaded = false;
  bool _downloading = false;
  double _downloadProgress = 0;
  List<String> _localPagePaths = [];

  Timer? _progressDebounce;

  @override
  void initState() {
    super.initState();
    _load();
    _checkDownloaded();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _progressDebounce?.cancel();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final detail = await _repo.fetch(widget.episodeId);
      if (!mounted) return;
      setState(() {
        _detail = detail;
        _loading = false;
      });
      // Jika sudah didownload, load dari local
      if (_isDownloaded) {
        await _loadLocalPages();
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _checkDownloaded() async {
    _isDownloaded = await DownloadService.instance.isDownloaded(widget.episodeId);
    if (_isDownloaded && mounted) {
      setState(() {});
      await _loadLocalPages();
    }
  }

  Future<void> _loadLocalPages() async {
    final items = await DownloadService.instance.getAll();
    final item = items.where((e) => e.episodeId == widget.episodeId).firstOrNull;
    if (item != null && mounted) {
      // Verify files still exist
      final existing = <String>[];
      for (final path in item.localPagePaths) {
        if (await File(path).exists()) {
          existing.add(path);
        }
      }
      setState(() => _localPagePaths = existing);
    }
  }

  void _onScroll() {
    if (_detail == null || _detail!.pages.isEmpty) return;
    final pos = _scrollController.position;
    final max = pos.maxScrollExtent;
    if (max <= 0) return;
    final pct = (pos.pixels / max * 100).clamp(0, 100).toDouble();
    setState(() => _progress = pct);
    _progressDebounce?.cancel();
    _progressDebounce = Timer(const Duration(milliseconds: 800), () {
      final lastPage = (_detail!.pages.length * pct / 100).ceil().clamp(1, _detail!.pages.length);
      _repo.recordProgress(
        episodeId: widget.episodeId,
        lastPage: lastPage,
        progress: pct,
        isCompleted: pct >= 98,
      ).catchError((_) {});
    });
  }

  Future<void> _downloadEpisode() async {
    if (_detail == null || _downloading) return;
    setState(() {
      _downloading = true;
      _downloadProgress = 0;
    });
    try {
      final detail = _detail!;
      String comicTitle = detail.episode.title;
      String? coverUrl;
      // Ambil judul + cover komik agar tampil benar di "Komik Offline".
      try {
        final comicDetail = await ComicDetailRepository().fetch(widget.comicId);
        comicTitle = comicDetail.comic.title;
        coverUrl = comicDetail.comic.coverUrl;
      } catch (_) {
        // Fallback ke judul episode bila detail komik tidak dapat dimuat
      }
      await DownloadService.instance.downloadWithNotification(
        detail: detail,
        comicTitle: comicTitle,
        comicCoverUrl: coverUrl,
        onProgress: (current, total, progress) {
          if (mounted) setState(() => _downloadProgress = progress);
        },
      );
      if (mounted) {
        setState(() {
          _isDownloaded = true;
          _downloading = false;
        });
        await _loadLocalPages();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Episode berhasil didownload untuk baca offline!')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _downloading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal download: $e')),
        );
      }
    }
  }

  Future<void> _deleteDownload() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Download'),
        content: const Text('Episode akan dihapus dari storage lokal. Kamu masih bisa membacanya secara online.'),
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

    await DownloadService.instance.deleteEpisode(widget.episodeId);
    if (mounted) {
      setState(() {
        _isDownloaded = false;
        _localPagePaths = [];
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Download dihapus.')),
      );
    }
  }

  Future<void> _unlock() async {
    setState(() => _unlocking = true);
    try {
      await _repo.unlock(widget.episodeId);
      if (!mounted) return;
      await _load();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } finally {
      if (mounted) setState(() => _unlocking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _ErrorView(message: _error!, onRetry: _load)
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final detail = _detail!;
    final episode = detail.episode;
    final locked = episode.isPremium && !episode.isUnlocked;
    final pageCount = _localPagePaths.isNotEmpty ? _localPagePaths.length : detail.pages.length;

    if (locked) {
      return _buildLockScreen(episode);
    }

    return Column(
      children: [
        // Top bar
        Container(
          color: AppTheme.background,
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.of(context).maybePop(),
                    visualDensity: VisualDensity.compact,
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          episode.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                        ),
                        Text(
                          'Eps ${episode.number} · ${detail.pages.length} halaman',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  Text('${_progress.toStringAsFixed(0)}%', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
                  const SizedBox(width: 4),
                  _downloading
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            value: _downloadProgress,
                            strokeWidth: 2,
                            color: AppTheme.brand,
                          ),
                        )
                      : IconButton(
                          icon: Icon(
                            _isDownloaded ? Icons.download_done : Icons.download,
                            size: 20,
                            color: _isDownloaded ? Colors.greenAccent : Colors.grey.shade500,
                          ),
                          onPressed: _isDownloaded ? _deleteDownload : _downloadEpisode,
                          visualDensity: VisualDensity.compact,
                          tooltip: _isDownloaded ? 'Hapus download' : 'Download episode',
                        ),
                ],
              ),
            ),
          ),
        ),
        // Progress bar
        LinearProgressIndicator(
          value: _progress / 100,
          minHeight: 2,
          backgroundColor: Colors.grey.shade900,
          valueColor: const AlwaysStoppedAnimation(AppTheme.brand),
        ),
        // Pages
        Expanded(
          child: detail.pages.isEmpty
              ? const Center(child: Text('Episode ini belum memiliki halaman.'))
              : ListView.builder(
                  controller: _scrollController,
                  itemCount: pageCount + 1,
                  itemBuilder: (context, index) {
                    if (index == pageCount) {
                      return _buildEpisodeNav(detail);
                    }
                    final isLocal = _localPagePaths.isNotEmpty && index < _localPagePaths.length;
                    final imageUrl = isLocal ? '' : ApiConstants.assetUrl(detail.pages[index].imageUrl);
                    final localPath = isLocal ? _localPagePaths[index] : null;
                    // Iklan setiap 3 halaman (sama seperti di web) —
                    // hanya akun non-premium/non-vvip. Iklan 100% lokal,
                    // tetap tampil saat offline (komik offline).
                    final showAd = _showAds && pageCount > 1 && (index + 1) % 3 == 0 && index < pageCount - 1;
                    return Column(
                      children: [
                        if (isLocal)
                          Image.file(
                            File(localPath!),
                            width: double.infinity,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stack) => Container(
                              height: MediaQuery.of(context).size.height * 0.7,
                              alignment: Alignment.center,
                              color: const Color(0xFF1E1B4B),
                              child: Text(
                                'Halaman ${index + 1}',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white70),
                              ),
                            ),
                          )
                        else if (imageUrl.isNotEmpty)
                          Image.network(
                            imageUrl,
                            width: double.infinity,
                            fit: BoxFit.contain,
                            loadingBuilder: (context, child, progress) {
                              if (progress == null) return child;
                              return Container(
                                height: MediaQuery.of(context).size.height * 0.7,
                                alignment: Alignment.center,
                                child: CircularProgressIndicator(
                                  value: progress.expectedTotalBytes != null
                                      ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                                      : null,
                                ),
                              );
                            },
                            errorBuilder: (context, error, stack) => Container(
                              height: MediaQuery.of(context).size.height * 0.7,
                              alignment: Alignment.center,
                              color: const Color(0xFF1E1B4B),
                              child: Text(
                                'Halaman ${detail.pages[index].pageNumber}',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white70),
                              ),
                            ),
                          ),
                        if (showAd)
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 12),
                            child: UpgradeAdBanner(full: true),
                          ),
                      ],
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildLockScreen(Episode episode) {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFEA580C)]),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.amber.withValues(alpha: 0.3),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(Icons.lock, size: 32, color: Colors.white),
              ),
              const SizedBox(height: 20),
              const Text('Episode Premium', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text('Buka episode ini dengan koin COMIKA', style: TextStyle(color: Colors.grey.shade400, fontSize: 13)),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.monetization_on, size: 22, color: Colors.amber),
                    const SizedBox(width: 6),
                    Text(
                      '${episode.priceCoin}',
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Colors.amber),
                    ),
                    const SizedBox(width: 4),
                    Text('koin', style: TextStyle(color: Colors.amber.shade200, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _unlocking ? null : _unlock,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFF59E0B),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _unlocking
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Unlock dengan Koin', style: TextStyle(fontWeight: FontWeight.w800)),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                AuthService.instance.isLoggedIn
                    ? 'Saldo akan dipotong otomatis dari dompetmu'
                    : 'Masuk dulu untuk membuka episode premium',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEpisodeNav(EpisodeDetail detail) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            if (detail.prev != null)
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _goToEpisode(detail.prev!.id),
                  icon: const Icon(Icons.arrow_back, size: 16),
                  label: const Text('Sebelumnya', style: TextStyle(fontSize: 13)),
                ),
              )
            else
              const Expanded(child: SizedBox()),
            const SizedBox(width: 12),
            if (detail.next != null)
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => _goToEpisode(detail.next!.id),
                  style: FilledButton.styleFrom(backgroundColor: AppTheme.brand),
                  icon: const Icon(Icons.arrow_forward, size: 16),
                  label: const Text('Berikutnya', style: TextStyle(fontSize: 13)),
                ),
              )
            else
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => Navigator.of(context).maybePop(),
                  style: FilledButton.styleFrom(backgroundColor: AppTheme.brand),
                  icon: const Icon(Icons.done, size: 16),
                  label: const Text('Selesai', style: TextStyle(fontSize: 13)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _goToEpisode(int episodeId) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => ReaderScreen(comicId: widget.comicId, episodeId: episodeId),
      ),
    );
  }

  /// Iklan hanya untuk akun non-premium & non-vvip (sama seperti di web).
  bool get _showAds {
    final user = AuthService.instance.user;
    return !(user?.isPremium ?? false) && !(user?.isVvip ?? false);
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
              const SizedBox(height: 12),
              Text(message, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
              const SizedBox(height: 16),
              FilledButton(onPressed: onRetry, child: const Text('Coba Lagi')),
            ],
          ),
        ),
      ),
    );
  }
}
