<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\Comic;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\User;
use App\Models\UserXp;
use App\Services\GamificationService;
use Database\Seeders\AchievementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class GamificationTest extends TestCase
{
    use RefreshDatabase;

    private User $creator;
    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(AchievementSeeder::class);

        $this->creator = User::factory()->creator()->create();
        $this->reader = User::factory()->reader()->create();
    }

    private function token(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    private function createComic(): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $this->creator->id,
            'title' => 'Komik Gamifikasi',
            'slug' => 'komik-gamifikasi',
            'synopsis' => 'Sinopsis komik gamifikasi',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'published_at' => now(),
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    private function createPublishedEpisode(Comic $comic, int $number = 1, int $pages = 2): Episode
    {
        $episode = $comic->episodes()->create([
            'title' => "Episode {$number}",
            'number' => $number,
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        for ($i = 1; $i <= $pages; $i++) {
            $episode->pages()->create([
                'page_number' => $i,
                'image_url' => "comic-pages/{$episode->id}/p{$i}.png",
            ]);
        }

        return $episode;
    }

    private function readEpisode(User $user, Episode $episode, int $lastPage): void
    {
        $this->withToken($this->token($user))
            ->postJson('/api/v1/reader/progress', [
                'episode_id' => $episode->id,
                'last_page' => $lastPage,
            ])->assertStatus(201);
    }

    // ============ Endpoint profile ============

    public function test_unauthenticated_cannot_access_gamification(): void
    {
        $this->getJson('/api/v1/me/gamification')->assertStatus(401);
    }

    public function test_profile_returns_full_structure(): void
    {
        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/gamification')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'level',
                    'total_xp',
                    'xp_into_level',
                    'xp_to_next_level',
                    'level_progress',
                    'streak' => ['current', 'longest', 'last_read_at'],
                    'stats' => ['episodes_read', 'comics_finished', 'comments', 'likes', 'follows', 'streak', 'level'],
                    'achievements' => [[
                        'code', 'name', 'description', 'xp_reward', 'earned', 'earned_at',
                    ]],
                ],
            ])
            ->assertJsonPath('data.level', 1)
            ->assertJsonPath('data.total_xp', 0)
            ->assertJsonCount(12, 'data.achievements');
    }

    public function test_all_achievements_are_seeded(): void
    {
        $this->assertDatabaseCount('achievements', 12);

        $codes = [
            'first_read', 'read_10', 'read_50', 'finish_comic', 'first_comment',
            'comment_10', 'first_follow', 'first_like', 'streak_3', 'streak_7',
            'level_5', 'level_10',
        ];

        foreach ($codes as $code) {
            $this->assertDatabaseHas('achievements', ['code' => $code]);
        }
    }

    // ============ XP daily login ============

    public function test_login_awards_daily_xp_once_per_day(): void
    {
        $email = $this->reader->email;

        // Login #1 → dapat XP 20
        $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'password',
        ])->assertStatus(200);

        $this->assertDatabaseHas('user_xp', [
            'user_id' => $this->reader->id,
            'total_xp' => GamificationService::XP_DAILY_LOGIN,
        ]);

        // Login #2 di hari yang sama → tidak dapat XP lagi
        $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'password',
        ])->assertStatus(200);

        $this->assertDatabaseHas('user_xp', [
            'user_id' => $this->reader->id,
            'total_xp' => GamificationService::XP_DAILY_LOGIN,
        ]);
    }

    public function test_daily_login_xp_resets_next_day(): void
    {
        $xp = UserXp::create([
            'user_id' => $this->reader->id,
            'total_xp' => GamificationService::XP_DAILY_LOGIN,
            'level' => 1,
            'last_login_at' => Carbon::yesterday(),
        ]);

        $service = app(GamificationService::class);
        $result = $service->trackDailyLogin($this->reader->fresh());

        $this->assertFalse($result['already']);
        $this->assertSame(GamificationService::XP_DAILY_LOGIN, $result['added_xp']);
        $this->assertSame(GamificationService::XP_DAILY_LOGIN * 2, $xp->fresh()->total_xp);
    }

    // ============ XP baca & streak ============

    public function test_first_read_awards_xp_but_reread_does_not(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);

        $this->readEpisode($this->reader, $episode, 1);

        // XP baca + reward achievement first_read (20)
        $this->assertDatabaseHas('user_xp', [
            'user_id' => $this->reader->id,
            'total_xp' => GamificationService::XP_READ_EPISODE
                + Achievement::where('code', GamificationService::ACH_FIRST_READ)->first()->xp_reward,
        ]);

        // Baca ulang episode yang sama → tidak dapat XP lagi
        $this->readEpisode($this->reader, $episode, 1);

        $xp = \App\Models\UserXp::where('user_id', $this->reader->id)->first();
        $this->assertSame(GamificationService::XP_READ_EPISODE
            + Achievement::where('code', GamificationService::ACH_FIRST_READ)->first()->xp_reward, $xp->total_xp);
    }

    public function test_reading_updates_streak(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);

        $this->readEpisode($this->reader, $episode, 1);

        $this->assertDatabaseHas('reading_streaks', [
            'user_id' => $this->reader->id,
            'current_streak' => 1,
            'longest_streak' => 1,
        ]);

        // Streak reset jika tidak membaca selama berhari-hari
        $streak = $this->reader->readingStreak;
        $streak->update(['last_read_at' => Carbon::now()->subDays(5)]);
        $this->reader->refresh();

        $this->readEpisode($this->reader, $episode, 1);

        $this->assertDatabaseHas('reading_streaks', [
            'user_id' => $this->reader->id,
            'current_streak' => 1,
            'longest_streak' => 1,
        ]);
    }

    // ============ XP aksi community ============

    public function test_comment_like_follow_award_xp(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        // Komentar
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/comments", [
            'content' => 'Keren!',
        ])->assertStatus(201);

        // Like
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/like")
            ->assertStatus(200);

        // Follow
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/follow")
            ->assertStatus(200);

        // XP aksi + reward achievement pertama (first_comment, first_like, first_follow)
        $expected = GamificationService::XP_COMMENT
            + Achievement::where('code', GamificationService::ACH_FIRST_COMMENT)->first()->xp_reward
            + GamificationService::XP_LIKE
            + Achievement::where('code', GamificationService::ACH_FIRST_LIKE)->first()->xp_reward
            + GamificationService::XP_FOLLOW
            + Achievement::where('code', GamificationService::ACH_FIRST_FOLLOW)->first()->xp_reward;

        $this->assertDatabaseHas('user_xp', [
            'user_id' => $this->reader->id,
            'total_xp' => $expected,
        ]);
    }

    public function test_unlike_and_unfollow_do_not_award_xp(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        // Like lalu unlike → hanya 1x XP
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/like")->assertStatus(200);
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/like")->assertStatus(200);

        // Follow lalu unfollow → hanya 1x XP
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/follow")->assertStatus(200);
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/follow")->assertStatus(200);

        $expected = GamificationService::XP_LIKE
            + Achievement::where('code', GamificationService::ACH_FIRST_LIKE)->first()->xp_reward
            + GamificationService::XP_FOLLOW
            + Achievement::where('code', GamificationService::ACH_FIRST_FOLLOW)->first()->xp_reward;

        $this->assertDatabaseHas('user_xp', [
            'user_id' => $this->reader->id,
            'total_xp' => $expected,
        ]);
    }

    // ============ Achievement ============

    public function test_first_read_unlocks_first_read_achievement(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);

        $this->readEpisode($this->reader, $episode, 1);

        $firstRead = Achievement::where('code', GamificationService::ACH_FIRST_READ)->first();

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $this->reader->id,
            'achievement_id' => $firstRead->id,
        ]);

        // XP reward achievement ikut ditambahkan
        $xp = UserXp::where('user_id', $this->reader->id)->first();
        $this->assertSame(
            GamificationService::XP_READ_EPISODE + $firstRead->xp_reward,
            $xp->total_xp
        );
    }

    public function test_achievement_is_only_earned_once(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic, 1, 4);

        $this->readEpisode($this->reader, $episode, 1);
        $this->readEpisode($this->reader, $episode, 2);

        // Hanya achievement first_read yang ter-unlock dari 2x baca episode sama
        // (episode belum selesai → finish_comic belum terpenuhi)
        $this->assertDatabaseCount('user_achievements', 1);
        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $this->reader->id,
            'achievement_id' => Achievement::where('code', GamificationService::ACH_FIRST_READ)->first()->id,
        ]);
    }

    public function test_finishing_comic_unlocks_completion_achievement(): void
    {
        $comic = $this->createComic();
        $ep1 = $this->createPublishedEpisode($comic, 1, 2);
        $ep2 = $this->createPublishedEpisode($comic, 2, 2);

        // Selesaikan semua episode → finish_comic ter-unlock
        $this->readEpisode($this->reader, $ep1, 2);
        $this->readEpisode($this->reader, $ep2, 2);

        $finish = Achievement::where('code', GamificationService::ACH_FINISH_COMIC)->first();

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $this->reader->id,
            'achievement_id' => $finish->id,
        ]);

        // Profile menampilkan achievement terkunci + terkunci (earned)
        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/gamification')
            ->assertStatus(200)
            ->assertJsonPath('data.stats.comics_finished', 1)
            ->assertJsonPath('data.stats.episodes_read', 2);
    }

    public function test_level_curve_and_level_up(): void
    {
        // Level 1: 0 XP; Level 2: 100 XP; Level 3: 300 XP; ...
        $this->assertSame(0, GamificationService::xpForLevel(1));
        $this->assertSame(100, GamificationService::xpForLevel(2));
        $this->assertSame(300, GamificationService::xpForLevel(3));
        $this->assertSame(1, GamificationService::levelForXp(0));
        $this->assertSame(1, GamificationService::levelForXp(99));
        $this->assertSame(2, GamificationService::levelForXp(100));
        $this->assertSame(3, GamificationService::levelForXp(300));

        $xp = UserXp::create([
            'user_id' => $this->reader->id,
            'total_xp' => 95,
            'level' => 1,
        ]);

        $result = app(GamificationService::class)->awardXp($this->reader, 10, 'test');

        $this->assertTrue($result['leveled_up']);
        $this->assertSame(2, $result['new_level']);
        $this->assertSame(105, $xp->fresh()->total_xp);

        // Level 5 → achievement level_5
        $xp->update(['total_xp' => 950, 'level' => 5]);

        app(GamificationService::class)->checkAchievements($this->reader->fresh());

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $this->reader->id,
            'achievement_id' => Achievement::where('code', GamificationService::ACH_LEVEL_5)->first()->id,
        ]);
    }

    public function test_profile_reports_progress_toward_next_level(): void
    {
        UserXp::create([
            'user_id' => $this->reader->id,
            'total_xp' => 150,
            'level' => 2,
        ]);

        // Level 2: floor 100, ceiling 300 → 50 XP masuk level, sisa 150 ke level 3
        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/gamification')
            ->assertStatus(200)
            ->assertJsonPath('data.level', 2)
            ->assertJsonPath('data.xp_into_level', 50)
            ->assertJsonPath('data.xp_to_next_level', 150)
            ->assertJsonPath('data.level_progress', 0.25);
    }

    public function test_streak_achievements_unlock_at_3_and_7(): void
    {
        $service = app(GamificationService::class);

        // Simulasi streak 3 hari: set directly lalu evaluasi
        $this->reader->readingStreak()->create([
            'current_streak' => 3,
            'longest_streak' => 3,
            'last_read_at' => Carbon::today(),
        ]);

        $service->checkAchievements($this->reader->fresh());

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $this->reader->id,
            'achievement_id' => Achievement::where('code', GamificationService::ACH_STREAK_3)->first()->id,
        ]);
        $this->assertDatabaseMissing('user_achievements', [
            'user_id' => $this->reader->id,
            'achievement_id' => Achievement::where('code', GamificationService::ACH_STREAK_7)->first()->id,
        ]);
    }
}
