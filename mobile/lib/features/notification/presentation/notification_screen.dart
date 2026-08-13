import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/notification.dart';
import '../../comic/presentation/comic_detail_screen.dart';
import '../../wallet/presentation/wallet_screen.dart';
import '../data/notification_repository.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final _repo = NotificationRepository();
  late Future<List<AppNotification>> _items;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _items = _repo.fetchAll();
  }

  Future<void> _refresh() async {
    setState(_load);
    await _items;
  }

  Future<void> _markAllRead() async {
    await _repo.markAllRead().catchError((_) {});
    if (mounted) setState(_load);
  }

  Future<void> _open(AppNotification n) async {
    if (!n.isRead) {
      // Optimistic: tandai dibaca lokal + kirim ke server (abaikan error)
      setState(() {
        _items = _items.then((list) => [
              for (final item in list)
                item.id == n.id
                    ? AppNotification(
                        id: item.id,
                        type: item.type,
                        data: item.data,
                        readAt: DateTime.now(),
                        createdAt: item.createdAt,
                      )
                    : item,
            ]);
      });
      _repo.markRead(n.id).catchError((_) {});
    }

    final comicId = n.comicId;
    if (n.type == 'transaction') {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const WalletScreen()),
      );
    } else if (comicId != null) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ComicDetailScreen(comicId: comicId)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifikasi', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 20)),
        actions: [
          TextButton.icon(
            onPressed: _markAllRead,
            icon: const Icon(Icons.done_all, size: 18),
            label: const Text('Baca semua'),
          ),
        ],
      ),
      body: FutureBuilder<List<AppNotification>>(
        future: _items,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _ErrorView(message: snapshot.error.toString(), onRetry: _refresh);
          }
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 140),
                  Icon(Icons.notifications_off_outlined, size: 48, color: Colors.grey),
                  SizedBox(height: 12),
                  Center(
                    child: Text(
                      'Belum ada notifikasi',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  SizedBox(height: 4),
                  Center(
                    child: Text(
                      'Episode baru, balasan komentar, dan info transaksi akan muncul di sini.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(12),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final n = items[index];
                return _NotificationTile(notification: n, onTap: () => _open(n));
              },
            ),
          );
        },
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;

  const _NotificationTile({required this.notification, required this.onTap});

  IconData get _icon {
    switch (notification.type) {
      case 'new_episode':
        return Icons.menu_book;
      case 'comic_update':
        return Icons.sync;
      case 'comment_reply':
        return Icons.chat_bubble_outline;
      case 'transaction':
        return Icons.monetization_on_outlined;
      default:
        return Icons.notifications_none;
    }
  }

  @override
  Widget build(BuildContext context) {
    final unread = !notification.isRead;
    return Material(
      color: unread ? AppTheme.surfaceLight : AppTheme.surface,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: unread ? AppTheme.brand.withValues(alpha: 0.15) : Colors.grey.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_icon, size: 19, color: unread ? AppTheme.brand : Colors.grey.shade400),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: unread ? Colors.white : Colors.grey.shade300,
                            ),
                          ),
                        ),
                        if (unread) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(top: 5),
                            decoration: const BoxDecoration(
                              color: AppTheme.brand,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      notification.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      Formatters.timeAgo(notification.createdAt),
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
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
            const Text('Tidak dapat memuat notifikasi'),
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
