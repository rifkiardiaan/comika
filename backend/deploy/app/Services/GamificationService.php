<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\Episode;
use App\Models\ReadingHistory;
use App\Models\ReadingStreak;
use App\Models\User;
use App\Models\UserXp;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Gamification (Phase 11): XP, level, reading streak & achievement.
 *
 * Desain:
 * - XP diberikan per event (login harian, baca episode, komentar, like, follow).
 * - Achievement memberikan XP reward sekali saja saat syaratnya terpenuhi.
 * - Level dihitung dari total XP dengan kurva: threshold(level) = 100 * level * (level-1) / 2.
 * - Reading streak dihitung dari hari membaca berturut-turut.
 */
class GamificationService
{
    // ============ Konstanta XP per event ============
    public const XP_DAILY_LOGIN = 20;
    public const XP_READ_EPISODE = 10;
    public const XP_COMMENT = 5;
    public const XP_LIKE = 3;
    public const XP_FOLLOW = 5;

    // ============ Achievement codes (sinkron dengan AchievementSeeder) ============
    public const ACH_FIRST_READ = 'first_read';
    public const ACH_READ_10 = 'read_10';
    public const ACH_READ_50 = 'read_50';
    public const ACH_FINISH_COMIC = 'finish_comic';
    public const ACH_FIRST_COMMENT = 'first_comment';
    public const ACH_COMMENT_10 = 'comment_10';
    public const ACH_FIRST_FOLLOW = 'first_follow';
    public const ACH_FIRST_LIKE = 'first_like';
    public const ACH_STREAK_3 = 'streak_3';
    public const ACH_STREAK_7 = 'streak_7';
    public const ACH_LEVEL_5 = 'level_5';
    public const ACH_LEVEL_10 = 'level_10';

    /** Kurva level: XP kumulatif yang dibutuhkan untuk mencapai `$level`. */
    public static function xpForLevel(int $level): int
    {
        return (int) (100 * $level * ($level - 1) / 2);
    }

    /** Hitung level dari total XP. */
    public static function levelForXp(int $totalXp): int
    {
        $level = 1;
        while (self::xpForLevel($level + 1) <= $totalXp) {
            $level++;
        }

        return $level;
    }

    /**
     * Ambil baris UserXp user; pastikan nilai default DB (0 XP, level 1)
     * tercermin di instance model karena firstOrCreate tidak me-refresh-nya.
     */
    private function xpRecord(User $user): UserXp
    {
        $xp = UserXp::firstOrCreate(['user_id' => $user->id]);
        $xp->total_xp ??= 0;
        $xp->level ??= 1;

        return $xp;
    }

    /**
     * Tambah XP ke user, perbarui level, lalu evaluasi achievement.
     *
     * @return array{added_xp: int, new_level: int, leveled_up: bool, unlocked: list<array<string, mixed>>}
     */
    public function awardXp(User $user, int $amount, ?string $reason = null): array
    {
        return DB::transaction(function () use ($user, $amount) {
            $xp = $this->xpRecord($user);

            $oldLevel = $xp->level;
            $xp->total_xp = max(0, $xp->total_xp + $amount);
            $xp->level = self::levelForXp($xp->total_xp);
            $xp->save();

            $leveledUp = $xp->level > $oldLevel;

            // Evaluasi achievement setelah perubahan XP. Catatan: reward XP
            // achievement dapat menaikkan level lebih jauh dari `new_level`
            // yang dikembalikan di sini — client disarankan me-refetch profil.
            $unlocked = $this->checkAchievements($user);

            return [
                'added_xp' => $amount,
                'new_level' => $xp->level,
                'leveled_up' => $leveledUp,
                'unlocked' => $unlocked,
            ];
        });
    }

    /**
     * Event login harian — XP hanya sekali per hari kalender.
     *
     * @return array{added_xp: int, already: bool}
     */
    public function trackDailyLogin(User $user): array
    {
        $xp = $this->xpRecord($user);

        $already = $xp->last_login_at !== null
            && $xp->last_login_at->isSameDay(now());

        if (! $already) {
            $xp->last_login_at = now();
            $xp->save();
            $this->awardXp($user, self::XP_DAILY_LOGIN, 'daily_login');

            return ['added_xp' => self::XP_DAILY_LOGIN, 'already' => false];
        }

        return ['added_xp' => 0, 'already' => true];
    }

    /**
     * Event membaca episode:
     * - XP baca hanya untuk episode yang baru pertama kali dibaca.
     * - Perbarui reading streak (hari membaca berturut-turut).
     * - Deteksi "selesai membaca komik" (semua episode terbit telah dibaca tuntas).
     *
     * @return array<string, mixed>
     */
    public function trackRead(User $user, Episode $episode, bool $isNewRead, bool $isCompleted = false): array
    {
        $result = ['added_xp' => 0];

        if ($isNewRead) {
            $result = $this->awardXp($user, self::XP_READ_EPISODE, 'read_episode');
        }

        $this->updateStreak($user);

        if ($isCompleted) {
            $this->checkComicCompletion($user, $episode);
        }

        return $result;
    }

    /** Event komentar. */
    public function trackComment(User $user): array
    {
        return $this->awardXp($user, self::XP_COMMENT, 'comment');
    }

    /** Event like (hanya saat menyukai, bukan membatalkan). */
    public function trackLike(User $user): array
    {
        return $this->awardXp($user, self::XP_LIKE, 'like');
    }

    /** Event follow (hanya saat mengikuti, bukan berhenti). */
    public function trackFollow(User $user): array
    {
        return $this->awardXp($user, self::XP_FOLLOW, 'follow');
    }

    /**
     * Update reading streak: kemarin → lanjut, hari ini → tetap, lainnya → reset ke 1.
     */
    public function updateStreak(User $user): ReadingStreak
    {
        return DB::transaction(function () use ($user) {
            $streak = ReadingStreak::firstOrCreate(['user_id' => $user->id]);

            $today = now()->toDateString();
            $lastRead = $streak->last_read_at;

            if ($lastRead && $lastRead->toDateString() === $today) {
                // Sudah tercatat hari ini — tidak berubah
            } elseif ($lastRead && $lastRead->isYesterday()) {
                $streak->current_streak++;
            } else {
                $streak->current_streak = 1;
            }

            $streak->last_read_at = now();
            $streak->longest_streak = max($streak->longest_streak, $streak->current_streak);
            $streak->save();

            return $streak->fresh();
        });
    }

    /**
     * Jika semua episode terbit sebuah komik sudah dibaca tuntas,
     * achievement "finish_comic" akan ter-unlock (sekali saja).
     */
    public function checkComicCompletion(User $user, Episode $episode): void
    {
        $comic = $episode->comic;
        $publishedIds = $comic->episodes()
            ->where('status', Episode::STATUS_PUBLISHED)
            ->pluck('id');

        if ($publishedIds->isEmpty()) {
            return;
        }

        $completedIds = ReadingHistory::where('user_id', $user->id)
            ->where('comic_id', $comic->id)
            ->where('is_completed', true)
            ->pluck('episode_id');

        if ($publishedIds->diff($completedIds)->isEmpty()) {
            $this->awardXp($user, 0);
        }
    }

    /**
     * Evaluasi semua achievement yang syaratnya terpenuhi dan belum dimiliki.
     *
     * @return list<array<string, mixed>>
     */
    public function checkAchievements(User $user): array
    {
        $stats = $this->stats($user);
        $owned = $user->achievements()->pluck('achievements.code')->all();
        $unlocked = [];

        // Evaluasi achievement berbasis level paling akhir agar reward XP
        // dari achievement lain di pass ini ikut diperhitungkan.
        $candidates = Achievement::whereNotIn('code', $owned)
            ->orderByRaw("CASE WHEN code IN (?, ?) THEN 1 ELSE 0 END", [
                self::ACH_LEVEL_5,
                self::ACH_LEVEL_10,
            ])
            ->orderBy('id')
            ->get();

        foreach ($candidates as $achievement) {
            if ($this->conditionMet($achievement->code, $stats)) {
                $user->achievements()->attach($achievement->id, ['earned_at' => now()]);

                if ($achievement->xp_reward > 0) {
                    $this->addXpSilently($user, $achievement->xp_reward);
                }

                $unlocked[] = [
                    'code' => $achievement->code,
                    'name' => $achievement->name,
                    'xp_reward' => $achievement->xp_reward,
                ];
            }
        }

        return $unlocked;
    }

    /**
     * Tambah XP tanpa rekursi ke checkAchievements (dipakai oleh reward achievement).
     */
    private function addXpSilently(User $user, int $amount): void
    {
        $xp = $this->xpRecord($user);
        $xp->total_xp = max(0, $xp->total_xp + $amount);
        $xp->level = self::levelForXp($xp->total_xp);
        $xp->save();
    }

    /**
     * Statistik user untuk mengevaluasi achievement.
     *
     * Komik "selesai" dihitung dengan 2 kueri agregat (bukan N+1):
     * semua episode terbit per komik, dan semua episode yang sudah
     * dituntaskan user — lalu dibandingkan dalam memori.
     */
    public function stats(User $user): array
    {
        $xp = $this->xpRecord($user);
        $streak = ReadingStreak::firstOrCreate(['user_id' => $user->id]);

        // Episode terbit per komik: [comic_id => [episode_id, ...]]
        $publishedByComic = Episode::query()
            ->where('status', Episode::STATUS_PUBLISHED)
            ->get(['id', 'comic_id'])
            ->groupBy('comic_id');

        // Episode yang sudah dituntaskan user: [comic_id => [episode_id, ...]]
        $completedByComic = ReadingHistory::query()
            ->where('user_id', $user->id)
            ->where('is_completed', true)
            ->get(['episode_id', 'comic_id'])
            ->groupBy('comic_id');

        $finishedComics = 0;
        foreach ($publishedByComic as $comicId => $publishedEpisodes) {
            $completedIds = $completedByComic->get($comicId, collect())
                ->pluck('episode_id');

            if ($publishedEpisodes->pluck('id')->diff($completedIds)->isEmpty()) {
                $finishedComics++;
            }
        }

        return [
            'episodes_read' => ReadingHistory::where('user_id', $user->id)->distinct('episode_id')->count('episode_id'),
            'comics_finished' => $finishedComics,
            'comments' => $user->comments()->count(),
            'likes' => $user->likes()->count(),
            'follows' => $user->follows()->count(),
            'streak' => (int) $streak->current_streak,
            'level' => (int) $xp->level,
        ];
    }

    private function conditionMet(string $code, array $stats): bool
    {
        return match ($code) {
            self::ACH_FIRST_READ => $stats['episodes_read'] >= 1,
            self::ACH_READ_10 => $stats['episodes_read'] >= 10,
            self::ACH_READ_50 => $stats['episodes_read'] >= 50,
            self::ACH_FINISH_COMIC => $stats['comics_finished'] >= 1,
            self::ACH_FIRST_COMMENT => $stats['comments'] >= 1,
            self::ACH_COMMENT_10 => $stats['comments'] >= 10,
            self::ACH_FIRST_FOLLOW => $stats['follows'] >= 1,
            self::ACH_FIRST_LIKE => $stats['likes'] >= 1,
            self::ACH_STREAK_3 => $stats['streak'] >= 3,
            self::ACH_STREAK_7 => $stats['streak'] >= 7,
            self::ACH_LEVEL_5 => $stats['level'] >= 5,
            self::ACH_LEVEL_10 => $stats['level'] >= 10,
            default => false,
        };
    }

    /**
     * Profil gamification lengkap untuk API.
     *
     * @return array<string, mixed>
     */
    public function profile(User $user): array
    {
        $xp = $this->xpRecord($user);
        $streak = ReadingStreak::firstOrCreate(['user_id' => $user->id]);
        $stats = $this->stats($user);

        $level = (int) $xp->level;
        $levelFloor = self::xpForLevel($level);
        $levelCeiling = self::xpForLevel($level + 1);
        $intoLevel = (int) $xp->total_xp - $levelFloor;
        $span = max(1, $levelCeiling - $levelFloor);

        $earned = $user->achievements()->get(['achievements.*'])->keyBy('code');
        $achievements = Achievement::orderBy('id')->get()->map(function (Achievement $achievement) use ($earned) {
            $earnedAt = $earned->has($achievement->code)
                ? $earned[$achievement->code]->pivot->earned_at
                : null;

            return [
                'code' => $achievement->code,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'xp_reward' => $achievement->xp_reward,
                'earned' => $earned->has($achievement->code),
                'earned_at' => $earnedAt ? Carbon::parse($earnedAt)->toIso8601String() : null,
            ];
        })->values();

        return [
            'level' => $level,
            'total_xp' => (int) $xp->total_xp,
            'xp_into_level' => $intoLevel,
            'xp_to_next_level' => max(0, $levelCeiling - (int) $xp->total_xp),
            'level_progress' => round($intoLevel / $span, 4),
            'last_login_at' => $xp->last_login_at?->toIso8601String(),
            'streak' => [
                'current' => (int) $streak->current_streak,
                'longest' => (int) $streak->longest_streak,
                'last_read_at' => $streak->last_read_at?->toIso8601String(),
            ],
            'stats' => $stats,
            'achievements' => $achievements,
        ];
    }
}
