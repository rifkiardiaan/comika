import '../core/constants/api_constants.dart';
import 'api_service.dart';

/// Service untuk API calls terkait creator dashboard dan analytics.
class CreatorService {
  final ApiService _api = ApiService.instance;

  /// Ambil data dashboard creator (termasuk reading report).
  Future<Map<String, dynamic>> fetchDashboard() async {
    final res = await _api.get(ApiConstants.creatorDashboard);
    return res['data'] as Map<String, dynamic>;
  }

  /// Ambil daftar komik creator.
  Future<Map<String, dynamic>> fetchComics({int page = 1}) async {
    final res = await _api.get(ApiConstants.creatorComics, {'page': page});
    return res;
  }

  /// Ambil detail komik creator.
  Future<Map<String, dynamic>> fetchComic(int comicId) async {
    final res = await _api.get(ApiConstants.creatorComicAnalytics(comicId));
    return res['data'] as Map<String, dynamic>;
  }

  /// Ambil ringkasan earnings creator.
  Future<Map<String, dynamic>> fetchEarnings({int page = 1}) async {
    final res = await _api.get(ApiConstants.creatorEarnings, {'page': page});
    return res;
  }

  /// Transfer earnings ke wallet.
  Future<Map<String, dynamic>> transferToWallet(double amount) async {
    final res = await _api.post(
      '${ApiConstants.creatorEarnings}/transfer-to-wallet',
      {'amount': amount},
    );
    return res;
  }

  /// Ambil daftar withdrawal creator.
  Future<Map<String, dynamic>> fetchWithdrawals({int page = 1}) async {
    final res = await _api.get(ApiConstants.creatorWithdrawals, {'page': page});
    return res;
  }

  /// Ajukan withdrawal.
  Future<Map<String, dynamic>> requestWithdrawal({
    required double amount,
    required String bankName,
    required String bankAccount,
    required String bankHolder,
  }) async {
    final res = await _api.post(ApiConstants.creatorWithdrawals, {
      'amount': amount,
      'bank_name': bankName,
      'bank_account': bankAccount,
      'bank_holder': bankHolder,
    });
    return res;
  }
}

/// Model untuk data dashboard creator.
class CreatorDashboardData {
  final int comicsCount;
  final int publishedComicsCount;
  final int episodesCount;
  final int publishedEpisodesCount;
  final int totalViews;
  final int totalLikes;
  final int totalFollowers;
  final int totalComments;
  final double ratingAvg;
  final EarningsData earnings;
  final ReadingReport readingReport;
  final List<RecentEpisode> recentEpisodes;
  final List<RecentComment> recentComments;

  const CreatorDashboardData({
    required this.comicsCount,
    required this.publishedComicsCount,
    required this.episodesCount,
    required this.publishedEpisodesCount,
    required this.totalViews,
    required this.totalLikes,
    required this.totalFollowers,
    required this.totalComments,
    required this.ratingAvg,
    required this.earnings,
    required this.readingReport,
    required this.recentEpisodes,
    required this.recentComments,
  });

  factory CreatorDashboardData.fromJson(Map<String, dynamic> json) {
    return CreatorDashboardData(
      comicsCount: (json['comics_count'] as num?)?.toInt() ?? 0,
      publishedComicsCount: (json['published_comics_count'] as num?)?.toInt() ?? 0,
      episodesCount: (json['episodes_count'] as num?)?.toInt() ?? 0,
      publishedEpisodesCount: (json['published_episodes_count'] as num?)?.toInt() ?? 0,
      totalViews: (json['total_views'] as num?)?.toInt() ?? 0,
      totalLikes: (json['total_likes'] as num?)?.toInt() ?? 0,
      totalFollowers: (json['total_followers'] as num?)?.toInt() ?? 0,
      totalComments: (json['total_comments'] as num?)?.toInt() ?? 0,
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 0,
      earnings: EarningsData.fromJson(json['earnings'] as Map<String, dynamic>? ?? {}),
      readingReport: ReadingReport.fromJson(json['reading_report'] as Map<String, dynamic>? ?? {}),
      recentEpisodes: (json['recent_episodes'] as List<dynamic>? ?? [])
          .map((e) => RecentEpisode.fromJson(e as Map<String, dynamic>))
          .toList(),
      recentComments: (json['recent_comments'] as List<dynamic>? ?? [])
          .map((e) => RecentComment.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

/// Model untuk data earnings.
class EarningsData {
  final double pending;
  final double paid;
  final double total;
  final RevenueShareData? revenueShare;

  const EarningsData({
    required this.pending,
    required this.paid,
    required this.total,
    this.revenueShare,
  });

  factory EarningsData.fromJson(Map<String, dynamic> json) {
    return EarningsData(
      pending: (json['pending'] as num?)?.toDouble() ?? 0,
      paid: (json['paid'] as num?)?.toDouble() ?? 0,
      total: (json['total'] as num?)?.toDouble() ?? 0,
      revenueShare: RevenueShareData.fromJson(json['revenue_share'] as Map<String, dynamic>?),
    );
  }
}

/// Model untuk pembagian pendapatan (revenue share) creator : platform.
class RevenueShareData {
  final double creatorShare;
  final double adminShare;
  final double coinValue;

  const RevenueShareData({
    required this.creatorShare,
    required this.adminShare,
    required this.coinValue,
  });

  factory RevenueShareData.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const RevenueShareData(creatorShare: 0.6, adminShare: 0.4, coinValue: 100);
    return RevenueShareData(
      creatorShare: (json['creator_share'] as num?)?.toDouble() ?? 0.6,
      adminShare: (json['admin_share'] as num?)?.toDouble() ?? 0.4,
      coinValue: (json['coin_value'] as num?)?.toDouble() ?? 100,
    );
  }
}

/// Model untuk reading report (gratis vs berbayar).
class ReadingReport {
  final int freeReads;
  final int paidReads;
  final int totalCoinsFromPaid;
  final String freeVsPaidRatio;

  const ReadingReport({
    required this.freeReads,
    required this.paidReads,
    required this.totalCoinsFromPaid,
    required this.freeVsPaidRatio,
  });

  factory ReadingReport.fromJson(Map<String, dynamic> json) {
    return ReadingReport(
      freeReads: (json['free_reads'] as num?)?.toInt() ?? 0,
      paidReads: (json['paid_reads'] as num?)?.toInt() ?? 0,
      totalCoinsFromPaid: (json['total_coins_from_paid'] as num?)?.toInt() ?? 0,
      freeVsPaidRatio: json['free_vs_paid_ratio'] as String? ?? '0:0',
    );
  }
}

/// Model untuk episode terbaru.
class RecentEpisode {
  final int id;
  final int comicId;
  final String comicTitle;
  final int number;
  final String title;
  final String status;
  final int viewCount;
  final String? publishedAt;

  const RecentEpisode({
    required this.id,
    required this.comicId,
    required this.comicTitle,
    required this.number,
    required this.title,
    required this.status,
    required this.viewCount,
    this.publishedAt,
  });

  factory RecentEpisode.fromJson(Map<String, dynamic> json) {
    return RecentEpisode(
      id: (json['id'] as num?)?.toInt() ?? 0,
      comicId: (json['comic_id'] as num?)?.toInt() ?? 0,
      comicTitle: json['comic_title'] as String? ?? '',
      number: (json['number'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? '',
      status: json['status'] as String? ?? 'draft',
      viewCount: (json['view_count'] as num?)?.toInt() ?? 0,
      publishedAt: json['published_at'] as String?,
    );
  }
}

/// Model untuk komentar terbaru.
class RecentComment {
  final int id;
  final int comicId;
  final String comicTitle;
  final String content;
  final String userName;
  final String? userAvatarUrl;
  final String createdAt;

  const RecentComment({
    required this.id,
    required this.comicId,
    required this.comicTitle,
    required this.content,
    required this.userName,
    this.userAvatarUrl,
    required this.createdAt,
  });

  factory RecentComment.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return RecentComment(
      id: (json['id'] as num?)?.toInt() ?? 0,
      comicId: (json['comic_id'] as num?)?.toInt() ?? 0,
      comicTitle: json['comic_title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      userName: user['name'] as String? ?? '',
      userAvatarUrl: user['avatar_url'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}
