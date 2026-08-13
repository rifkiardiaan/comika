import '../../../core/constants/api_constants.dart';
import '../../../services/api_service.dart';

/// Achievement yang bisa dibuka user.
class AchievementInfo {
  final String code;
  final String name;
  final String description;
  final int xpReward;
  final bool earned;
  final String? earnedAt;

  const AchievementInfo({
    required this.code,
    required this.name,
    required this.description,
    required this.xpReward,
    required this.earned,
    this.earnedAt,
  });

  factory AchievementInfo.fromJson(Map<String, dynamic> json) {
    return AchievementInfo(
      code: json['code'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      xpReward: (json['xp_reward'] as num?)?.toInt() ?? 0,
      earned: json['earned'] as bool? ?? false,
      earnedAt: json['earned_at'] as String?,
    );
  }
}

/// Ringkasan gamification user: level, XP, streak & statistik.
class GamificationProfile {
  final int level;
  final int totalXp;
  final int xpIntoLevel;
  final int xpToNextLevel;
  final double levelProgress;
  final int streakCurrent;
  final int streakLongest;
  final int episodesRead;
  final int comicsFinished;
  final List<AchievementInfo> achievements;

  const GamificationProfile({
    required this.level,
    required this.totalXp,
    required this.xpIntoLevel,
    required this.xpToNextLevel,
    required this.levelProgress,
    required this.streakCurrent,
    required this.streakLongest,
    required this.episodesRead,
    required this.comicsFinished,
    required this.achievements,
  });

  int get earnedCount => achievements.where((a) => a.earned).length;

  factory GamificationProfile.fromJson(Map<String, dynamic> json) {
    final streak = json['streak'] as Map<String, dynamic>? ?? const {};
    final stats = json['stats'] as Map<String, dynamic>? ?? const {};
    final achievements = (json['achievements'] as List<dynamic>? ?? const [])
        .map((a) => AchievementInfo.fromJson(a as Map<String, dynamic>))
        .toList();

    return GamificationProfile(
      level: (json['level'] as num?)?.toInt() ?? 1,
      totalXp: (json['total_xp'] as num?)?.toInt() ?? 0,
      xpIntoLevel: (json['xp_into_level'] as num?)?.toInt() ?? 0,
      xpToNextLevel: (json['xp_to_next_level'] as num?)?.toInt() ?? 0,
      levelProgress: (json['level_progress'] as num?)?.toDouble() ?? 0,
      streakCurrent: (streak['current'] as num?)?.toInt() ?? 0,
      streakLongest: (streak['longest'] as num?)?.toInt() ?? 0,
      episodesRead: (stats['episodes_read'] as num?)?.toInt() ?? 0,
      comicsFinished: (stats['comics_finished'] as num?)?.toInt() ?? 0,
      achievements: achievements,
    );
  }
}

/// Repository gamification.
class GamificationRepository {
  final ApiService _api = ApiService.instance;

  Future<GamificationProfile> fetchProfile() async {
    final res = await _api.get(ApiConstants.gamification);
    return GamificationProfile.fromJson(res['data'] as Map<String, dynamic>);
  }
}
