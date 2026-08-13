/// Utilitas format angka & tanggal untuk tampilan.
class Formatters {
  Formatters._();

  /// Format angka besar: 1.2jt, 45rb, 900
  static String compact(int value) {
    if (value >= 1000000) {
      final v = value / 1000000;
      return '${v.toStringAsFixed(v % 1 == 0 ? 0 : 1).replaceAll('.', ',')}jt';
    }
    if (value >= 1000) {
      final v = value / 1000;
      return '${v.toStringAsFixed(v % 1 == 0 ? 0 : 1).replaceAll('.', ',')}rb';
    }
    return value.toString();
  }

  /// Format tanggal ke format Indonesia: 12 Agu 2026
  static String date(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  /// Waktu relatif: "baru saja", "5 mnt lalu", "2 jam lalu", "3 hari lalu".
  static String timeAgo(DateTime value) {
    final diff = DateTime.now().difference(value);
    if (diff.inMinutes < 1) return 'baru saja';
    if (diff.inHours < 1) return '${diff.inMinutes} mnt lalu';
    if (diff.inDays < 1) return '${diff.inHours} jam lalu';
    if (diff.inDays < 30) return '${diff.inDays} hari lalu';
    return date(value);
  }
}
