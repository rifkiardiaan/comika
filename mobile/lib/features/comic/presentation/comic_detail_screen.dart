import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/comic.dart';
import '../../../models/comment.dart';
import '../../../models/episode.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../../../services/download_notification_service.dart';
import '../../../services/download_service.dart';
import '../data/comment_repository.dart';
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

  bool _liked = false;
  int _likeCount = 0;
  bool _busy = false;
  bool _batchDownloading = false;
  double _batchProgress = 0;
  String _batchStatus = '';

  // Comment state
  final _commentRepo = CommentRepository();
  final _commentController = TextEditingController();
  final _commentFocusNode = FocusNode();
  List<Comment> _comments = [];
  CommentPagination? _commentPagination;
  bool _loadingComments = false;
  bool _postingComment = false;
  int? _replyToCommentId;
  String? _replyToUserName;

  @override
  void initState() {
    super.initState();
    _future = _load();
    _loadComments();
  }

  Future<ComicDetail> _load() async {
    final detail = await _repo.fetch(widget.comicId);
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
                            active: false,
                            activeColor: Colors.blueAccent,
                            label: 'Offline',
                            onTap: () {
                              if (!_busy) _downloadAllEpisodes();
                            },
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
                      const SizedBox(height: 12),
                      // Download Semua button
                      if (detail.episodes.isNotEmpty)
                        _batchDownloading
                            ? Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: AppTheme.brand.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        const SizedBox(
                                          width: 16, height: 16,
                                          child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            _batchStatus.isNotEmpty ? _batchStatus : 'Mendownload semua episode...',
                                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                          ),
                                        ),
                                        Text(
                                          '${(_batchProgress * 100).toInt()}%',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.brand),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(6),
                                      child: LinearProgressIndicator(
                                        value: _batchProgress,
                                        minHeight: 6,
                                        backgroundColor: Colors.white.withValues(alpha: 0.1),
                                        valueColor: const AlwaysStoppedAnimation(AppTheme.brand),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  onPressed: _busy ? null : _downloadAllEpisodes,
                                  icon: const Icon(Icons.download_rounded, size: 18),
                                  label: const Text('Download Semua Episode'),
                                  style: OutlinedButton.styleFrom(
                                    side: BorderSide(color: AppTheme.brand.withValues(alpha: 0.4)),
                                    backgroundColor: AppTheme.brand.withValues(alpha: 0.08),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  ),
                                ),
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
                        comicTitle: comic.title,
                      );
                    },
                    childCount: detail.episodes.length,
                  ),
                ),
              ),
              // === Comment Section ===
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.comment_outlined, size: 18, color: Colors.grey.shade400),
                          const SizedBox(width: 8),
                          Text(
                            'Komentar',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.grey.shade100),
                          ),
                          if (_comments.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            Text(
                              '(${_commentPagination?.total ?? _comments.length})',
                              style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Comment input
                      _buildCommentInput(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
              // Comment list
              if (_loadingComments && _comments.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                )
              else if (_comments.isEmpty && !_loadingComments)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(Icons.chat_bubble_outline, size: 36, color: Colors.grey.shade700),
                          const SizedBox(height: 8),
                          Text('Belum ada komentar', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                          const SizedBox(height: 4),
                          Text('Jadilah yang pertama berkomentar!', style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
                        ],
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        if (index == _comments.length) {
                          // Load more button
                          if (_commentPagination != null && _commentPagination!.hasMore) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              child: Center(
                                child: _loadingComments
                                    ? const CircularProgressIndicator(strokeWidth: 2)
                                    : TextButton(
                                        onPressed: _loadMoreComments,
                                        child: const Text('Muat Lebih Banyak'),
                                      ),
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        }
                        return _CommentTile(
                          comment: _comments[index],
                          onReply: (comment) {
                            setState(() {
                              _replyToCommentId = comment.id;
                              _replyToUserName = comment.user.name;
                            });
                            _commentFocusNode.requestFocus();
                          },
                          onDelete: AuthService.instance.user?.id == _comments[index].user.id
                              ? () => _deleteComment(_comments[index].id)
                              : null,
                        );
                      },
                      childCount: _comments.length + 1,
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

  Future<void> _downloadAllEpisodes() async {
    if (_busy || _batchDownloading) return;

    final detail = await _future;
    if (!mounted) return;

    // Filter episode yang bisa didownload (premium yang sudah di-unlock atau non-premium)
    final accessibleEpisodes = <EpisodeDetail>[];
    final repo = ComicDetailRepository();
    final comic = detail.comic;

    setState(() {
      _batchDownloading = true;
      _batchProgress = 0;
      _batchStatus = 'Memuat detail episode...';
    });

    try {
      for (int i = 0; i < detail.episodes.length; i++) {
        final ep = detail.episodes[i];
        // Skip premium yang terkunci untuk anonim
        if (ep.isPremium && !AuthService.instance.isLoggedIn) continue;
        // Skip yang sudah didownload
        final alreadyDone = await DownloadService.instance.isDownloaded(ep.id);
        if (alreadyDone) continue;

        try {
          final epDetail = await repo.fetchEpisodeDetail(ep.id);
          accessibleEpisodes.add(epDetail);
        } catch (_) {
          // Skip episode yang gagal dimuat
        }
      }

      if (accessibleEpisodes.isEmpty) {
        if (mounted) {
          setState(() {
            _batchDownloading = false;
            _batchProgress = 0;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Semua episode sudah didownload atau tidak bisa diakses.')),
          );
        }
        return;
      }

      // Init notification service
      await DownloadNotificationService.instance.init();

      // Batch download dengan progress
      int downloaded = 0;
      await DownloadService.instance.downloadAllEpisodes(
        episodes: accessibleEpisodes,
        comicTitle: comic.title,
        comicCoverUrl: null,
        onProgress: (current, total, epTitle, progress) {
          if (mounted) {
            setState(() {
              _batchProgress = progress;
              _batchStatus = 'Downloading $current/$total — $epTitle';
            });
          }
        },
      );
      downloaded = accessibleEpisodes.length;

      if (mounted) {
        setState(() {
          _batchDownloading = false;
          _batchProgress = 0;
          _batchStatus = '';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$downloaded episode berhasil didownload!')),
        );
        // Refresh episode tiles
        _reload();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _batchDownloading = false;
          _batchProgress = 0;
          _batchStatus = '';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  // ────────── Comments ──────────

  Future<void> _loadComments() async {
    if (_loadingComments) return;
    setState(() => _loadingComments = true);
    try {
      final result = await _commentRepo.fetchComments(widget.comicId);
      if (mounted) {
        setState(() {
          _comments = result.data;
          _commentPagination = result.pagination;
          _loadingComments = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingComments = false);
    }
  }

  Future<void> _loadMoreComments() async {
    if (_loadingComments || _commentPagination == null || !_commentPagination!.hasMore) return;
    setState(() => _loadingComments = true);
    try {
      final result = await _commentRepo.fetchComments(
        widget.comicId,
        page: _commentPagination!.currentPage + 1,
      );
      if (mounted) {
        setState(() {
          _comments.addAll(result.data);
          _commentPagination = result.pagination;
          _loadingComments = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingComments = false);
    }
  }

  Future<void> _postComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty || _postingComment) return;
    if (!AuthService.instance.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masuk untuk berkomentar.')),
      );
      return;
    }

    setState(() => _postingComment = true);
    try {
      final newComment = await _commentRepo.postComment(
        widget.comicId,
        content: text,
        parentId: _replyToCommentId,
      );
      _commentController.clear();
      setState(() {
        _replyToCommentId = null;
        _replyToUserName = null;
        // Add to top of list
        _comments.insert(0, newComment);
        _postingComment = false;
      });
      _commentFocusNode.unfocus();
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _postingComment = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (_) {
      if (mounted) {
        setState(() => _postingComment = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal mengirim komentar.')),
        );
      }
    }
  }

  Future<void> _deleteComment(int commentId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Komentar'),
        content: const Text('Yakin ingin menghapus komentar ini?'),
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
    try {
      await _commentRepo.deleteComment(commentId);
      setState(() {
        _comments.removeWhere((c) => c.id == commentId);
      });
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menghapus komentar.')),
        );
      }
    }
  }

  Widget _buildCommentInput() {
    final isLoggedIn = AuthService.instance.isLoggedIn;
    final user = AuthService.instance.user;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.surfaceLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_replyToUserName != null)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.brand.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Text(
                    'Membalas @$_replyToUserName',
                    style: const TextStyle(fontSize: 12, color: AppTheme.brand, fontWeight: FontWeight.w600),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => setState(() {
                      _replyToCommentId = null;
                      _replyToUserName = null;
                    }),
                    child: const Icon(Icons.close, size: 14, color: AppTheme.brand),
                  ),
                ],
              ),
            ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // User avatar
              if (isLoggedIn && user != null)
                _CommentAvatarWidget(avatarUrl: user.avatarUrl, name: user.name, size: 32)
              else
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade800,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.person, size: 16, color: Colors.grey.shade500),
                ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _commentController,
                  focusNode: _commentFocusNode,
                  maxLines: null,
                  enabled: isLoggedIn,
                  style: const TextStyle(fontSize: 13),
                  decoration: InputDecoration(
                    hintText: isLoggedIn ? 'Tulis komentar...' : 'Masuk untuk berkomentar',
                    hintStyle: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                    filled: true,
                    fillColor: AppTheme.surfaceLight,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    isDense: true,
                  ),
                  onSubmitted: (_) => _postComment(),
                ),
              ),
              const SizedBox(width: 8),
              _postingComment
                  ? const SizedBox(
                      width: 28,
                      height: 28,
                      child: Padding(
                        padding: EdgeInsets.all(4),
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand),
                      ),
                    )
                  : IconButton(
                      icon: const Icon(Icons.send, size: 20, color: AppTheme.brand),
                      onPressed: _postComment,
                      visualDensity: VisualDensity.compact,
                    ),
            ],
          ),
        ],
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

  @override
  void dispose() {
    _commentController.dispose();
    _commentFocusNode.dispose();
    super.dispose();
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

class _EpisodeTile extends StatefulWidget {
  final Episode episode;
  final bool locked;
  final VoidCallback onTap;
  final String? comicTitle;

  const _EpisodeTile({required this.episode, required this.locked, required this.onTap, this.comicTitle});

  @override
  State<_EpisodeTile> createState() => _EpisodeTileState();
}

class _EpisodeTileState extends State<_EpisodeTile> {
  bool _isDownloaded = false;
  bool _downloading = false;

  @override
  void initState() {
    super.initState();
    _checkDownloaded();
  }

  Future<void> _checkDownloaded() async {
    final downloaded = await DownloadService.instance.isDownloaded(widget.episode.id);
    if (mounted) setState(() => _isDownloaded = downloaded);
  }

  Future<void> _downloadEpisode() async {
    if (_downloading) return;
    setState(() => _downloading = true);
    try {
      await DownloadNotificationService.instance.init();
      final repo = ComicDetailRepository();
      final detail = await repo.fetchEpisodeDetail(widget.episode.id);
      if (!mounted) return;
      await DownloadService.instance.downloadEpisode(
        detail: detail,
        comicTitle: widget.comicTitle,
        comicCoverUrl: null,
        showNotification: true,
      );
      if (mounted) {
        setState(() {
          _isDownloaded = true;
          _downloading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Episode didownload untuk baca offline!')),
        );
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
    await DownloadService.instance.deleteEpisode(widget.episode.id);
    if (mounted) {
      setState(() => _isDownloaded = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Download dihapus.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: widget.onTap,
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
                  child: widget.locked
                      ? const Icon(Icons.lock, size: 17, color: Colors.amber)
                      : Text('${widget.episode.number}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.episode.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      Text(
                        '${Formatters.compact(widget.episode.viewCount)} dibaca',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                // Download button
                if (!widget.locked)
                  _downloading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: Padding(
                            padding: EdgeInsets.all(4),
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand),
                          ),
                        )
                      : IconButton(
                          icon: Icon(
                            _isDownloaded ? Icons.download_done : Icons.download,
                            size: 18,
                            color: _isDownloaded ? Colors.greenAccent : Colors.grey,
                          ),
                          onPressed: _isDownloaded ? _deleteDownload : _downloadEpisode,
                          tooltip: _isDownloaded ? 'Hapus download' : 'Download offline',
                          visualDensity: VisualDensity.compact,
                        ),
                if (widget.episode.isPremium)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: widget.locked ? Colors.amber.withValues(alpha: 0.15) : Colors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(widget.locked ? Icons.lock : Icons.lock_open, size: 11, color: widget.locked ? Colors.amber : Colors.greenAccent),
                        const SizedBox(width: 3),
                        Text(
                          widget.locked ? '${widget.episode.priceCoin} koin' : 'Terbuka',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: widget.locked ? Colors.amber : Colors.greenAccent,
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

/// Widget avatar untuk komentar — tampilkan foto profil atau fallback inisial.
class _CommentAvatarWidget extends StatelessWidget {
  final String? avatarUrl;
  final String name;
  final double size;

  const _CommentAvatarWidget({required this.avatarUrl, required this.name, this.size = 36});

  @override
  Widget build(BuildContext context) {
    final url = ApiConstants.assetUrl(avatarUrl);
    if (url.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(size / 3.5),
        child: Image.network(
          url,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _fallback(),
        ),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppTheme.brand, AppTheme.pink]),
        borderRadius: BorderRadius.circular(size / 3.5),
      ),
      child: Text(
        name.isEmpty ? '?' : name.characters.first.toUpperCase(),
        style: TextStyle(fontSize: size * 0.4, fontWeight: FontWeight.w800, color: Colors.white),
      ),
    );
  }
}

/// Tile komentar — menampilkan avatar, nama, konten, dan tombol balas/hapus.
class _CommentTile extends StatelessWidget {
  final Comment comment;
  final void Function(Comment) onReply;
  final VoidCallback? onDelete;

  const _CommentTile({
    required this.comment,
    required this.onReply,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final timeAgo = _formatTimeAgo(comment.createdAt);

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.surfaceLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: avatar + name + time
            Row(
              children: [
                _CommentAvatarWidget(
                  avatarUrl: comment.user.avatarUrl,
                  name: comment.user.name,
                  size: 32,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              comment.user.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                            ),
                          ),
                          if (comment.user.isVvip) ...[
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                              decoration: BoxDecoration(
                                color: Colors.purpleAccent.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('VVIP', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Colors.purpleAccent)),
                            ),
                          ],
                        ],
                      ),
                      if (timeAgo.isNotEmpty)
                        Text(timeAgo, style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                    ],
                  ),
                ),
                // Delete button (own comment)
                if (onDelete != null)
                  PopupMenuButton<String>(
                    itemBuilder: (ctx) => [
                      const PopupMenuItem(value: 'delete', child: Text('Hapus', style: TextStyle(color: Colors.redAccent))),
                    ],
                    onSelected: (v) {
                      if (v == 'delete') onDelete!();
                    },
                    child: Icon(Icons.more_vert, size: 16, color: Colors.grey.shade600),
                  ),
              ],
            ),
            // Reply indicator
            if (comment.parentUser != null)
              Padding(
                padding: const EdgeInsets.only(left: 42, top: 4),
                child: Text(
                  '↩ Membalas ${comment.parentUser!.name}',
                  style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontStyle: FontStyle.italic),
                ),
              ),
            // Content
            Padding(
              padding: const EdgeInsets.only(left: 42, top: 6),
              child: Text(comment.content, style: const TextStyle(fontSize: 13, height: 1.4)),
            ),
            // Actions: like count + reply button
            Padding(
              padding: const EdgeInsets.only(left: 42, top: 8),
              child: Row(
                children: [
                  if (comment.likeCount > 0)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.favorite, size: 13, color: Colors.pinkAccent.withValues(alpha: 0.7)),
                        const SizedBox(width: 3),
                        Text('${comment.likeCount}', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                        const SizedBox(width: 12),
                      ],
                    ),
                  GestureDetector(
                    onTap: () => onReply(comment),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.reply, size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 3),
                        Text('Balas', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Replies
            if (comment.replies.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(left: 20, top: 8),
                child: Column(
                  children: comment.replies.map((reply) => _ReplyTile(
                    reply: reply,
                    onReply: onReply,
                  )).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime? date) {
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inSeconds < 60) return 'baru saja';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m lalu';
    if (diff.inHours < 24) return '${diff.inHours}j lalu';
    if (diff.inDays < 30) return '${diff.inDays}h lalu';
    if (diff.inDays < 365) return '${(diff.inDays / 30).floor()}bln lalu';
    return '${(diff.inDays / 365).floor()}thn lalu';
  }
}

/// Tile balasan komentar — compact version.
class _ReplyTile extends StatelessWidget {
  final Comment reply;
  final void Function(Comment) onReply;

  const _ReplyTile({required this.reply, required this.onReply});

  @override
  Widget build(BuildContext context) {
    final timeAgo = _formatTimeAgo(reply.createdAt);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CommentAvatarWidget(
            avatarUrl: reply.user.avatarUrl,
            name: reply.user.name,
            size: 24,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        reply.user.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ),
                    if (reply.user.isVvip) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
                        decoration: BoxDecoration(
                          color: Colors.purpleAccent.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: const Text('VVIP', style: TextStyle(fontSize: 7, fontWeight: FontWeight.w800, color: Colors.purpleAccent)),
                      ),
                    ],
                    if (timeAgo.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      Text(timeAgo, style: TextStyle(fontSize: 9, color: Colors.grey.shade600)),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(reply.content, style: const TextStyle(fontSize: 12, height: 1.3)),
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: () => onReply(reply),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.reply, size: 12, color: Colors.grey.shade600),
                      const SizedBox(width: 2),
                      Text('Balas', style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime? date) {
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inSeconds < 60) return 'baru saja';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m lalu';
    if (diff.inHours < 24) return '${diff.inHours}j lalu';
    if (diff.inDays < 30) return '${diff.inDays}h lalu';
    if (diff.inDays < 365) return '${(diff.inDays / 30).floor()}bln lalu';
    return '${(diff.inDays / 365).floor()}thn lalu';
  }
}
