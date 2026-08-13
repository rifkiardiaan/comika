import 'package:flutter/material.dart';

import '../../../models/comic.dart';
import '../data/comic_repository.dart';
import '../widgets/comic_card.dart';
import '../../comic/presentation/comic_detail_screen.dart';
import '../../notification/data/notification_repository.dart';
import '../../notification/presentation/notification_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _repository = ComicRepository();
  late Future<List<Comic>> _comics;

  @override
  void initState() {
    super.initState();
    _comics = _repository.fetchTrending();
  }

  void _openComic(Comic comic) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ComicDetailScreen(comicId: comic.id)),
    );
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
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(child: _buildHome()),
    );
  }

  Widget _buildHome() {
    return FutureBuilder<List<Comic>>(
      future: _comics,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return _buildError(snapshot.error.toString());
        }
        final comics = snapshot.data ?? [];
        if (comics.isEmpty) {
          return const Center(child: Text('Belum ada komik.'));
        }
        return RefreshIndicator(
          onRefresh: () async {
            setState(() => _comics = _repository.fetchTrending());
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Trending Minggu Ini',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Komik paling banyak dibaca saat ini',
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.52,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => GestureDetector(
                      onTap: () => _openComic(comics[index]),
                      child: ComicCard(comic: comics[index]),
                    ),
                    childCount: comics.length,
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildError(String message) {
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
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => setState(() => _comics = _repository.fetchTrending()),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
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
            right: 2,
            top: 2,
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
