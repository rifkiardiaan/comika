import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../../../services/creator_service.dart';

/// Halaman dashboard creator — menampilkan statistik, laporan pembacaan,
/// dan pendapatan komik.
class CreatorDashboardScreen extends StatefulWidget {
  const CreatorDashboardScreen({super.key});

  @override
  State<CreatorDashboardScreen> createState() => _CreatorDashboardScreenState();
}

class _CreatorDashboardScreenState extends State<CreatorDashboardScreen> {
  final _service = CreatorService();
  CreatorDashboardData? _data;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final json = await _service.fetchDashboard();
      if (mounted) {
        setState(() {
          _data = CreatorDashboardData.fromJson(json);
          _loading = false;
        });
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _error = e.message;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Gagal memuat dashboard creator.';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService.instance.user;

    if (user == null || !user.isCreator) {
      return Scaffold(
        appBar: AppBar(title: const Text('Dashboard Creator')),
        body: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock_outline, size: 48, color: Colors.grey),
              SizedBox(height: 12),
              Text('Khusus Creator', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              SizedBox(height: 4),
              Text('Dashboard ini hanya tersedia untuk akun creator.', style: TextStyle(color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Creator'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.redAccent)),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: _load,
                          style: FilledButton.styleFrom(backgroundColor: AppTheme.brand),
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      // === Admin-only publish notice ===
                      _buildPublishNotice(),
                      const SizedBox(height: 16),

                      // === Stat cards ===
                      _buildStatCards(),
                      const SizedBox(height: 16),

                      // === Earnings card ===
                      _buildEarningsCard(),
                      const SizedBox(height: 16),

                      // === Reading Report (Free vs Paid) ===
                      _buildReadingReport(),
                      const SizedBox(height: 16),

                      // === Recent Episodes ===
                      _buildRecentEpisodes(),
                      const SizedBox(height: 16),

                      // === Recent Comments ===
                      _buildRecentComments(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }

  /// Notice: Creator tidak bisa publish sendiri.
  Widget _buildPublishNotice() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Colors.amber, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Anda hanya bisa mengunggah komik/episode. Pempublikasian hanya bisa dilakukan oleh admin setelah disetujui.',
              style: TextStyle(color: Colors.amber.shade200, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  /// Stat cards: Komik, Episode, Views, Rating.
  Widget _buildStatCards() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.4,
      children: [
        _statCard(
          icon: Icons.book_outlined,
          color: AppTheme.brand,
          label: 'Komik',
          value: '${_data?.comicsCount ?? 0}',
          sub: '${_data?.publishedComicsCount ?? 0} terbit',
        ),
        _statCard(
          icon: Icons.article_outlined,
          color: Colors.cyanAccent,
          label: 'Episode',
          value: '${_data?.episodesCount ?? 0}',
          sub: '${_data?.publishedEpisodesCount ?? 0} terbit',
        ),
        _statCard(
          icon: Icons.visibility_outlined,
          color: Colors.greenAccent,
          label: 'Total Dibaca',
          value: _formatNumber(_data?.totalViews ?? 0),
          sub: '${_formatNumber(_data?.totalLikes ?? 0)} suka',
        ),
        _statCard(
          icon: Icons.star_outline,
          color: Colors.amberAccent,
          label: 'Rating',
          value: (_data?.ratingAvg ?? 0).toStringAsFixed(1),
          sub: '${_formatNumber(_data?.totalFollowers ?? 0)} pengikut',
        ),
      ],
    );
  }

  Widget _statCard({
    required IconData icon,
    required Color color,
    required String label,
    required String value,
    required String sub,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(sub, style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
        ],
      ),
    );
  }

  /// Earnings card — total, pending, paid.
  Widget _buildEarningsCard() {
    final earnings = _data?.earnings;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.green.withValues(alpha: 0.3), AppTheme.surface],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.account_balance_wallet, color: Colors.greenAccent, size: 18),
              SizedBox(width: 8),
              Text('Total Pendapatan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.greenAccent)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Rp ${(earnings?.total ?? 0).toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}',
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _earnChip('Menunggu', earnings?.pending ?? 0, Colors.amberAccent),
              const SizedBox(width: 8),
              _earnChip('Dibayar', earnings?.paid ?? 0, Colors.greenAccent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _earnChip(String label, double amount, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
            const SizedBox(height: 2),
            Text(
              'Rp ${amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color),
            ),
          ],
        ),
      ),
    );
  }

  /// Reading Report — Gratis vs Berbayar.
  Widget _buildReadingReport() {
    final report = _data?.readingReport;
    if (report == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.pie_chart_outline, color: Colors.purpleAccent, size: 18),
              SizedBox(width: 8),
              Text('Laporan Pembacaan', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _reportCard('Gratis', report.freeReads, Colors.greenAccent, 'episode gratis dibaca')),
              const SizedBox(width: 12),
              Expanded(child: _reportCard('Berbayar', report.paidReads, Colors.amberAccent, 'episode premium di-unlock')),
            ],
          ),
          const SizedBox(height: 12),
          _reportCard('Total Koin dari Berbayar', report.totalCoinsFromPaid, Colors.cyanAccent, 'koin dari unlock premium'),
          const SizedBox(height: 12),
          Center(
            child: Text(
              'Rasio Gratis : Berbayar = ${report.freeVsPaidRatio}',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
            ),
          ),
        ],
      ),
    );
  }

  Widget _reportCard(String label, int value, Color color, String sub) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
          const SizedBox(height: 4),
          Text(
            '$value',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color),
          ),
          const SizedBox(height: 2),
          Text(sub, style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
        ],
      ),
    );
  }

  /// Recent Episodes list.
  Widget _buildRecentEpisodes() {
    final episodes = _data?.recentEpisodes ?? [];
    return _sectionCard(
      title: 'Episode Terbaru',
      icon: Icons.schedule,
      iconColor: Colors.cyanAccent,
      child: episodes.isEmpty
          ? Padding(
              padding: const EdgeInsets.all(20),
              child: Center(
                child: Text('Belum ada episode.', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
              ),
            )
          : Column(
              children: episodes.take(5).map((ep) => _episodeTile(ep)).toList(),
            ),
    );
  }

  Widget _episodeTile(RecentEpisode ep) {
    final isPublished = ep.status == 'published';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.04))),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('${ep.number}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(ep.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(ep.comicTitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: isPublished ? Colors.greenAccent.withValues(alpha: 0.15) : Colors.orangeAccent.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              isPublished ? 'Terbit' : 'Draft',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: isPublished ? Colors.greenAccent : Colors.orangeAccent,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text('${ep.viewCount}', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
        ],
      ),
    );
  }

  /// Recent Comments list.
  Widget _buildRecentComments() {
    final comments = _data?.recentComments ?? [];
    return _sectionCard(
      title: 'Komentar Terbaru',
      icon: Icons.comment_outlined,
      iconColor: Colors.tealAccent,
      child: comments.isEmpty
          ? Padding(
              padding: const EdgeInsets.all(20),
              child: Center(
                child: Text('Belum ada komentar dari pembaca.', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
              ),
            )
          : Column(
              children: comments.take(5).map((c) => _commentTile(c)).toList(),
            ),
    );
  }

  Widget _commentTile(RecentComment comment) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.04))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _commentAvatar(comment.userName),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(children: [
                    TextSpan(text: comment.userName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                    TextSpan(text: ' pada ${comment.comicTitle}', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
                  ]),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(comment.content, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, color: Colors.grey.shade300)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _commentAvatar(String name) {
    return Container(
      width: 32,
      height: 32,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppTheme.brand, AppTheme.pink]),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        name.isEmpty ? '?' : name.characters.first.toUpperCase(),
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
      ),
    );
  }

  /// Reusable section card.
  Widget _sectionCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              children: [
                Icon(icon, size: 16, color: iconColor),
                const SizedBox(width: 6),
                Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          child,
        ],
      ),
    );
  }

  String _formatNumber(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return '$n';
  }
}
