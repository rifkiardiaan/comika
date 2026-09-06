<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Comic;
use App\Models\Episode;
use App\Models\EpisodePage;
use App\Models\Genre;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $creator;
    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->creator = User::factory()->creator()->create();
        $this->reader = User::factory()->reader()->create();
    }

    private function token(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    private function createComic(array $overrides = []): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $this->creator->id,
            'title' => 'Komik Riwayat',
            'slug' => 'komik-riwayat-'.uniqid(),
            'synopsis' => 'Sinopsis komik riwayat',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'verification_status' => 'draft',
            'view_count' => 10,
            'like_count' => 1,
            'rating_avg' => 0,
            'rating_count' => 0,
            ...$overrides,
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    private function createEpisode(Comic $comic, int $number = 1, bool $withPage = true): Episode
    {
        $episode = $comic->episodes()->create([
            'title' => "Episode {$number}",
            'number' => $number,
            'status' => Episode::STATUS_DRAFT,
            'is_premium' => false,
            'price_coin' => 0,
        ]);

        if ($withPage) {
            EpisodePage::create([
                'episode_id' => $episode->id,
                'page_number' => 1,
                'image_url' => 'demo-pages/p1.svg',
            ]);
        }

        return $episode;
    }

    private function assertHasActivity(string $action, ?int $subjectId = null, ?int $actorId = null): void
    {
        $query = ActivityLog::where('action', $action);
        if ($subjectId !== null) {
            $query->where('subject_id', $subjectId);
        }
        if ($actorId !== null) {
            $query->where('user_id', $actorId);
        }

        $this->assertTrue($query->exists(), "Activity {$action} seharusnya tercatat.");
    }

    // ============ Creator: kirim komik & episode ============

    public function test_creator_submitting_comic_records_activity_and_notification(): void
    {
        $comic = $this->createComic();
        $this->createEpisode($comic);

        $this->withToken($this->token($this->creator))
            ->postJson("/api/v1/creator/comics/{$comic->id}/submit")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertHasActivity(ActivityLog::ACTION_COMIC_UPLOAD, $comic->id, $this->creator->id);
    }

    public function test_creator_submitting_episode_for_review_records_activity(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic);

        $this->withToken($this->token($this->creator))
            ->postJson("/api/v1/episodes/{$episode->id}/publish")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertHasActivity(ActivityLog::ACTION_EPISODE_SUBMIT, $episode->id, $this->creator->id);
    }

    // ============ Admin: publish & verify komik ============

    public function test_admin_publishing_comic_records_activity_and_notifies_creator(): void
    {
        $comic = $this->createComic();

        $this->withToken($this->token($this->admin))
            ->postJson("/api/v1/admin/comics/{$comic->id}/publish")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertHasActivity(ActivityLog::ACTION_COMIC_PUBLISH, $comic->id, $this->admin->id);
        $this->assertSame(1, Notification::where('user_id', $this->creator->id)->count());
    }

    public function test_admin_rejecting_comic_records_activity(): void
    {
        $comic = $this->createComic();

        $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/comics/{$comic->id}/verify", [
                'verification_status' => 'rejected',
                'rejection_reason' => 'Konten tidak sesuai.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertHasActivity(ActivityLog::ACTION_COMIC_BAN, $comic->id, $this->admin->id);
        $this->assertSame(1, Notification::where('user_id', $this->creator->id)->count());
    }

    // ============ Admin: episode publish / reject / delete ============

    public function test_admin_publishing_episode_records_activity(): void
    {
        $comic = $this->createComic([
            'published_at' => now(),
            'verification_status' => Comic::VERIFICATION_APPROVED,
        ]);
        $episode = $this->createEpisode($comic);

        $this->withToken($this->token($this->admin))
            ->postJson("/api/v1/admin/episodes/{$episode->id}/publish")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertHasActivity(ActivityLog::ACTION_EPISODE_PUBLISH, $episode->id, $this->admin->id);
    }

    public function test_admin_rejecting_episode_deletes_it_and_records_activity(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic);

        $this->withToken($this->token($this->admin))
            ->postJson("/api/v1/admin/episodes/{$episode->id}/reject", ['reason' => 'Gambar buram.'])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertTrue($episode->fresh()->trashed(), 'Episode seharusnya terhapus (soft delete).');
        $this->assertHasActivity(ActivityLog::ACTION_EPISODE_REJECT, $comic->id, $this->admin->id);
        $this->assertSame(1, Notification::where('user_id', $this->creator->id)->count());
    }

    public function test_admin_deleting_episode_records_activity_and_notifies_creator(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic);

        $this->withToken($this->token($this->admin))
            ->deleteJson("/api/v1/admin/episodes/{$episode->id}")
            ->assertStatus(200);

        $this->assertHasActivity(ActivityLog::ACTION_EPISODE_DELETE, $comic->id, $this->admin->id);
        $this->assertSame(1, Notification::where('user_id', $this->creator->id)->count());
    }

    public function test_admin_deleting_comic_records_activity_and_notifies_creator(): void
    {
        $comic = $this->createComic();

        $this->withToken($this->token($this->admin))
            ->deleteJson("/api/v1/admin/comics/{$comic->id}")
            ->assertStatus(200);

        $this->assertHasActivity(ActivityLog::ACTION_COMIC_BAN, null, $this->admin->id);
        $this->assertSame(1, Notification::where('user_id', $this->creator->id)->count());
    }

    // ============ Download offline ============

    public function test_download_log_endpoint_records_activity(): void
    {
        $comic = $this->createComic([
            'published_at' => now(),
            'verification_status' => Comic::VERIFICATION_APPROVED,
        ]);

        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/comics/{$comic->id}/download-log", [
                'episode_count' => 3,
                'page_count' => 40,
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertHasActivity(ActivityLog::ACTION_COMIC_DOWNLOAD, $comic->id, $this->reader->id);

        $log = ActivityLog::where('action', ActivityLog::ACTION_COMIC_DOWNLOAD)->firstOrFail();
        $this->assertSame(['episode_count' => 3, 'page_count' => 40], $log->metadata);
    }

    // ============ Admin: daftar riwayat & filter ============

    public function test_admin_activities_list_with_filters(): void
    {
        $comic = $this->createComic();
        ActivityLog::create([
            'user_id' => $this->creator->id,
            'action' => ActivityLog::ACTION_COMIC_UPLOAD,
            'description' => 'Creator mengirim komik untuk direview',
            'subject_type' => Comic::class,
            'subject_id' => $comic->id,
        ]);
        ActivityLog::create([
            'user_id' => $this->admin->id,
            'action' => ActivityLog::ACTION_COMIC_PUBLISH,
            'description' => 'Admin menerbitkan komik',
            'subject_type' => Comic::class,
            'subject_id' => $comic->id,
        ]);

        $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/activities')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.user.name', $this->admin->name);

        $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/activities?action=comic_publish')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_admin_dashboard_includes_activity_stats(): void
    {
        $comic = $this->createComic();
        ActivityLog::create([
            'user_id' => $this->creator->id,
            'action' => ActivityLog::ACTION_COMIC_UPLOAD,
            'description' => 'Creator mengirim komik untuk direview',
            'subject_type' => Comic::class,
            'subject_id' => $comic->id,
        ]);

        $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/dashboard')
            ->assertStatus(200)
            ->assertJsonPath('data.activities.total', 1)
            ->assertJsonPath('data.activities.today', 1)
            ->assertJsonCount(1, 'data.activities.by_action')
            ->assertJsonCount(1, 'data.activities.recent');
    }

    public function test_non_admin_cannot_read_activities(): void
    {
        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/admin/activities')
            ->assertStatus(403);
    }
}