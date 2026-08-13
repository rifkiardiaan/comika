/// Notifikasi in-app COMIKA (blueprint 24).
class AppNotification {
  final String id;
  final String type;
  final Map<String, dynamic> data;
  final DateTime? readAt;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.data,
    this.readAt,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'system',
      data: (json['data'] as Map<String, dynamic>?) ?? const {},
      readAt: json['read_at'] != null ? DateTime.tryParse(json['read_at'] as String) : null,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  bool get isRead => readAt != null;

  /// Judul singkat sesuai jenis notifikasi.
  String get title {
    switch (type) {
      case 'new_episode':
        return 'Episode ${data['episode_number'] ?? ''} — ${data['episode_title'] ?? 'Baru'}';
      case 'comic_update':
        return 'Status "${data['comic_title'] ?? 'Komik'}" diperbarui';
      case 'comment_reply':
        return 'Komentarmu dibalas';
      case 'transaction':
        return data['coins'] != null ? 'Pembelian koin berhasil' : 'Penarikan dana diperbarui';
      default:
        return 'Notifikasi';
    }
  }

  /// Deskripsi pelengkap sesuai jenis notifikasi.
  String get description {
    switch (type) {
      case 'new_episode':
        return 'Episode baru dari ${data['comic_title'] ?? 'komik yang kamu ikuti'}';
      case 'comic_update':
        return 'Status komik kini: ${data['status'] ?? ''}';
      case 'comment_reply':
        return data['reply_snippet'] as String? ?? 'Seseorang membalas komentarmu';
      case 'transaction':
        if (data['coins'] != null) return '${data['coins']} koin ditambahkan ke dompetmu';
        return 'Status penarikan: ${data['status'] ?? ''}';
      default:
        return '';
    }
  }

  /// ID komik terkait (untuk navigasi), jika ada.
  int? get comicId => (data['comic_id'] as num?)?.toInt();
}
