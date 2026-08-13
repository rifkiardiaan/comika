<?php

namespace Tests\Feature;

use App\Models\Comic;
use App\Models\Comment;
use App\Models\CreatorProfile;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
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
            'title' => 'Komik Admin',
            'slug' => 'komik-admin-'.uniqid(),
            'synopsis' => 'Sinopsis komik admin',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'view_count' => 100,
            'like_count' => 5,
            'rating_avg' => 4.5,
            'rating_count' => 2,
            'published_at' => now(),
            ...$overrides,
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    private function createComment(Comic $comic, string $status = Comment::STATUS_ACTIVE): Comment
    {
        return Comment::create([
            'user_id' => $this->reader->id,
            'comic_id' => $comic->id,
            'content' => 'Komentar untuk moderasi',
            'status' => $status,
        ]);
    }

    private function createReport(Comic $comic, string $status = Report::STATUS_PENDING): Report
    {
        return Report::create([
            'reporter_id' => $this->reader->id,
            'reportable_type' => Comic::class,
            'reportable_id' => $comic->id,
            'reason' => 'spam',
            'description' => 'Konten duplikat.',
            'status' => $status,
        ]);
    }

    // ============ Autentikasi & Otorisasi ============

    public function test_unauthenticated_cannot_access_admin_endpoints(): void
    {
        $this->getJson('/api/v1/admin/dashboard')->assertStatus(401);
        $this->getJson('/api/v1/admin/users')->assertStatus(401);
        $this->getJson('/api/v1/admin/reports')->assertStatus(401);
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        foreach ([$this->reader, $this->creator] as $user) {
            $this->withToken($this->token($user))
                ->getJson('/api/v1/admin/dashboard')
                ->assertStatus(403)
                ->assertJsonPath('success', false);
        }
    }

    // ============ Dashboard ============

    public function test_admin_dashboard_returns_platform_stats(): void
    {
        $comic = $this->createComic();
        $this->createComic(['published_at' => null, 'title' => 'Draft']);
        $comic->episodes()->create([
            'title' => 'Episode 1',
            'number' => 1,
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);
        $this->createComment($comic);
        $this->createReport($comic);

        $response = $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.users.total', 3)
            ->assertJsonPath('data.users.creators', 1)
            ->assertJsonPath('data.users.admins', 1)
            ->assertJsonPath('data.comics.total', 2)
            ->assertJsonPath('data.comics.published', 1)
            ->assertJsonPath('data.comics.draft', 1)
            ->assertJsonPath('data.episodes.total', 1)
            ->assertJsonPath('data.episodes.published', 1)
            ->assertJsonPath('data.comments', 1)
            ->assertJsonPath('data.reports.pending', 1)
            ->assertJsonPath('data.engagement.total_views', 200)
            ->assertJsonPath('data.engagement.total_likes', 10)
            ->assertJsonCount(3, 'data.recent_users')
            ->assertJsonCount(2, 'data.recent_comics')
            ->assertJsonCount(1, 'data.recent_reports');
    }

    // ============ Manajemen User ============

    public function test_admin_can_list_users_with_search_and_role_filter(): void
    {
        User::factory()->reader()->create([
            'name' => 'Pencari Khusus',
            'username' => 'pencari',
            'email' => 'pencari@example.com',
        ]);

        $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/users?role=reader&q=pencari')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.role', 'reader')
            ->assertJsonStructure(['data' => [['id', 'name', 'username', 'email', 'role', 'coin_balance']]]);
    }

    public function test_admin_can_change_user_role(): void
    {
        $response = $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/users/{$this->reader->id}/role", ['role' => 'creator']);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'creator');

        $this->assertDatabaseHas('users', ['id' => $this->reader->id, 'role' => 'creator']);
    }

    public function test_admin_cannot_change_own_role(): void
    {
        $response = $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/users/{$this->admin->id}/role", ['role' => 'reader']);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_delete_user(): void
    {
        $response = $this->withToken($this->token($this->admin))
            ->deleteJson("/api/v1/admin/users/{$this->reader->id}");

        $response->assertStatus(200)->assertJsonPath('success', true);
        $this->assertSoftDeleted('users', ['id' => $this->reader->id]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $this->withToken($this->token($this->admin))
            ->deleteJson("/api/v1/admin/users/{$this->admin->id}")
            ->assertStatus(422);
    }

    // ============ Manajemen Creator ============

    public function test_admin_can_list_creators_with_stats(): void
    {
        $comic = $this->createComic();
        $this->creator->creatorProfile()->update([
            'display_name' => 'Studio Test',
            'is_verified' => true,
        ]);

        $response = $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/creators');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.display_name', 'Studio Test')
            ->assertJsonPath('data.0.is_verified', true)
            ->assertJsonPath('data.0.comics_count', 1)
            ->assertJsonPath('data.0.total_views', 100);
    }

    public function test_admin_can_verify_creator(): void
    {
        $response = $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/creators/{$this->creator->id}/verify", ['verified' => true]);

        $response->assertStatus(200)
            ->assertJsonPath('data.is_verified', true);

        $this->assertDatabaseHas('creator_profiles', [
            'user_id' => $this->creator->id,
            'is_verified' => 1,
        ]);
    }

    public function test_admin_cannot_verify_non_creator(): void
    {
        $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/creators/{$this->reader->id}/verify", ['verified' => true])
            ->assertStatus(422);
    }

    // ============ Moderasi Komik ============

    public function test_admin_can_list_all_comics_including_drafts(): void
    {
        $this->createComic();
        $this->createComic(['published_at' => null, 'title' => 'Draft Admin']);

        $response = $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/comics?visibility=draft');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'Draft Admin');
    }

    public function test_admin_can_update_comic_status(): void
    {
        $comic = $this->createComic();

        $response = $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/comics/{$comic->id}/status", ['status' => 'completed']);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('comics', ['id' => $comic->id, 'status' => 'completed']);
    }

    public function test_admin_can_delete_comic(): void
    {
        $comic = $this->createComic();

        $this->withToken($this->token($this->admin))
            ->deleteJson("/api/v1/admin/comics/{$comic->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('comics', ['id' => $comic->id]);
    }

    // ============ Moderasi Komentar ============

    public function test_admin_can_list_and_hide_comment(): void
    {
        $comic = $this->createComic();
        $comment = $this->createComment($comic);

        $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/comments?status=active')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1);

        $response = $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/comments/{$comment->id}/moderate", ['status' => 'hidden']);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'hidden');
    }

    public function test_admin_can_delete_comment(): void
    {
        $comic = $this->createComic();
        $comment = $this->createComment($comic);

        $this->withToken($this->token($this->admin))
            ->deleteJson("/api/v1/admin/comments/{$comment->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    // ============ Laporan ============

    public function test_admin_can_list_reports_with_pending_first(): void
    {
        $comic = $this->createComic();
        $this->createReport($comic, Report::STATUS_RESOLVED);
        $this->createReport($comic, Report::STATUS_PENDING);

        $response = $this->withToken($this->token($this->admin))
            ->getJson('/api/v1/admin/reports');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('data.0.status', 'pending')
            ->assertJsonPath('data.0.reportable.type', 'comic')
            ->assertJsonPath('data.0.reportable.title', 'Komik Admin');
    }

    public function test_admin_can_handle_report(): void
    {
        $comic = $this->createComic();
        $report = $this->createReport($comic);

        $response = $this->withToken($this->token($this->admin))
            ->patchJson("/api/v1/admin/reports/{$report->id}/handle", [
                'status' => 'resolved',
                'admin_note' => 'Sudah dihapus.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved')
            ->assertJsonPath('data.admin_note', 'Sudah dihapus.')
            ->assertJsonPath('data.handled_by.id', $this->admin->id);

        $this->assertNotNull($report->fresh()->handled_at);
    }

    // ============ Genre ============

    public function test_admin_can_create_update_and_delete_genre(): void
    {
        $create = $this->withToken($this->token($this->admin))
            ->postJson('/api/v1/admin/genres', ['name' => 'Slice of Life']);

        $create->assertStatus(201)
            ->assertJsonPath('data.slug', 'slice-of-life');

        $genre = Genre::where('slug', 'slice-of-life')->firstOrFail();

        $update = $this->withToken($this->token($this->admin))
            ->putJson("/api/v1/admin/genres/{$genre->id}", ['name' => 'Sekolah']);

        $update->assertStatus(200)
            ->assertJsonPath('data.name', 'Sekolah')
            ->assertJsonPath('data.slug', 'sekolah');

        $this->withToken($this->token($this->admin))
            ->deleteJson("/api/v1/admin/genres/{$genre->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('genres', ['id' => $genre->id]);
    }

    public function test_reader_cannot_manage_genres(): void
    {
        $this->withToken($this->token($this->reader))
            ->postJson('/api/v1/admin/genres', ['name' => 'Bajak'])
            ->assertStatus(403);
    }
}
