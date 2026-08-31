/// Konfigurasi endpoint API COMIKA.
class ApiConstants {
  ApiConstants._();

  /// Base URL API — ganti saat build production / real device.
  /// - Emulator Android: http://10.0.2.2:8000
  /// - Browser/desktop:  http://127.0.0.1:8000
  static const String baseUrl = 'https://comika.free.nf/api/v1';

  /// Host API (tanpa /api/v1) — dipakai untuk membangun URL file storage.
  static String get apiOrigin {
    final withoutPrefix = baseUrl.replaceFirst(RegExp(r'/api/v1/*'), '');
    return withoutPrefix.endsWith('/') ? withoutPrefix.substring(0, withoutPrefix.length - 1) : withoutPrefix;
  }

  /// Ubah path storage relatif (mis. "avatars/x.png") menjadi URL absolut.
  static String assetUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return '$apiOrigin/storage/${path.replaceFirst(RegExp(r'^/'), '')}';
  }

  // Auth
  static const String login = '$baseUrl/auth/login';
  static const String register = '$baseUrl/auth/register';
  static const String logout = '$baseUrl/auth/logout';
  static const String me = '$baseUrl/auth/me';
  static const String mePassword = '$baseUrl/auth/me/password';
  static const String meProfile = '$baseUrl/auth/me/profile';
  static const String meAvatar = '$baseUrl/auth/me/avatar';

  // Komik & genre
  static const String comics = '$baseUrl/comics';
  static const String genres = '$baseUrl/genres';
  static String comicsSearch(String q) => '$comics?q=$q';

  // Reader
  static const String history = '$baseUrl/reader/history';
  static const String progress = '$baseUrl/reader/progress';

  // Community
  static const String bookmarks = '$baseUrl/me/bookmarks';
  static const String follows = '$baseUrl/me/follows';

  // Monetization
  static const String wallet = '$baseUrl/me/wallet';
  static const String transactions = '$baseUrl/me/transactions';
  static const String coinPackages = '$baseUrl/coin-packages';

  // Gamification (Phase 11)
  static const String gamification = '$baseUrl/me/gamification';

  // Notifications (blueprint 24)
  static const String notifications = '$baseUrl/me/notifications';
  static const String notificationsUnreadCount = '$baseUrl/me/notifications/unread-count';
  static const String notificationsReadAll = '$baseUrl/me/notifications/read-all';
  static String notificationRead(String id) => '$notifications/$id/read';

  static String comic(int id) => '$comics/$id';
  static String episodesOf(int comicId) => '$comics/$comicId/episodes';
  static String episode(int id) => '$baseUrl/episodes/$id';
  static String comicBookmark(int comicId) => '$comics/$comicId/bookmark';
  static String comicFollow(int comicId) => '$comics/$comicId/follow';
  static String comicLike(int comicId) => '$comics/$comicId/like';
  static String episodeUnlock(int episodeId) => '$baseUrl/episodes/$episodeId/unlock';
  static String purchasePackage(int packageId) => '$coinPackages/$packageId/purchase';
  static String comicComments(int comicId) => '$comics/$comicId/comments';

  // Creator
  static const String creatorDashboard = '$baseUrl/creator/dashboard';
  static const String creatorComics = '$baseUrl/creator/comics';
  static const String creatorProfile = '$baseUrl/creator/profile';
  static String creatorComicAnalytics(int comicId) => '$baseUrl/creator/comics/$comicId/analytics';
  static const String creatorEarnings = '$baseUrl/creator/earnings';
  static const String creatorWithdrawals = '$baseUrl/creator/withdrawals';
}
