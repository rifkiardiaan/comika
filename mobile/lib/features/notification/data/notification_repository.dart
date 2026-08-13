import '../../../core/constants/api_constants.dart';
import '../../../models/notification.dart';
import '../../../services/api_service.dart';

/// Akses API notifikasi in-app.
class NotificationRepository {
  final _api = ApiService.instance;

  /// Daftar notifikasi user (terbaru dulu).
  Future<List<AppNotification>> fetchAll() async {
    final res = await _api.get(ApiConstants.notifications);
    final items = res['data'] as List<dynamic>? ?? const [];
    return items
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Jumlah notifikasi belum dibaca (badge).
  Future<int> unreadCount() async {
    final res = await _api.get(ApiConstants.notificationsUnreadCount);
    return (res['data']?['unread_count'] as num?)?.toInt() ?? 0;
  }

  /// Tandai satu notifikasi sudah dibaca.
  Future<void> markRead(String id) async {
    await _api.put(ApiConstants.notificationRead(id));
  }

  /// Tandai semua notifikasi sudah dibaca.
  Future<void> markAllRead() async {
    await _api.post(ApiConstants.notificationsReadAll);
  }
}
