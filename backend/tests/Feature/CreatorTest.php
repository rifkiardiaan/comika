<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Comic;
use App\Models\CreatorEarning;
use App\Models\Episode;
use App\Models\Follow;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CreatorTest extends TestCase
{
    use RefreshDatabase;

    private User $creator;
    private User $otherCreator;
    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->creator = User::factory()->creator()->create();
        $this->otherCreator = User::factory()->creator()->create();
        $this->reader = User::factory()->reader()->create();
    }

    private function token(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    private function createComic(User $creator, array $overrides = []): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $creator->id,
            'title' => 'Komik Creator',
            'slug' => 'komik-creator-'.uniqid(),
            'synopsis' => 'Sinopsis komik creator',
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

    private function createEpisode(Comic $comic, int $number, string $status = Episode::STATUS_PUBLISHED): Episode
    {
        return $comic->episodes()->create([
            'title' => "Episode {$number}",
            'number' => $number,
            'status' => $status,
            'view_count' => 50,
            'published_at' => $status === Episode::STATUS_PUBLISHED ? now() : null,
        ]);
    }

    // ============ Autentikasi & Otorisasi ============

    public function test_unauthenticated_cannot_access_creator_endpoints(): void
    {
        $this->getJson('/api/v1/creator/dashboard')->assertStatus(401);
        $this->getJson('/api/v1/creator/comics')->assertStatus(401);
    }

    public function test_reader_cannot_access_creator_endpoints(): void
    {
        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/creator/dashboard')
            ->assertStatus(403);
    }

    public function test_creator_cannot_view_others_comic_analytics(): void
    {
        $comic = $this->createComic($this->creator);

        $this->withToken($this->token($this->otherCreator))
            ->getJson("/api/v1/creator/comics/{$comic->id}/analytics")
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    // ============ Dashboard ============

    public function test_creator_dashboard_returns_summary_stats(): void
    {
        $comic = $this->createComic($this->creator);
        $episode = $this->createEpisode($comic, 1);
        $this->createEpisode($comic, 2);
        $draftComic = $this->createComic($this->creator, ['published_at' => null]);
        $this->createEpisode($draftComic, 1, Episode::STATUS_DRAFT);

        // Aktivitas: follow + komentar
        Follow::create(['user_id' => $this->reader->id, 'comic_id' => $comic->id]);
        Comment::create([
            'user_id' => $this->reader->id,
            'comic_id' => $comic->id,
            'content' => 'Keren!',
            'status' => Comment::STATUS_ACTIVE,
        ]);
        CreatorEarning::create([
            'creator_id' => $this->creator->id,
            'episode_id' => $episode->id,
            'amount' => 5000,
            'status' => CreatorEarning::STATUS_PENDING,
        ]);

        $response = $this->withToken($this->token($this->creator))
            ->getJson('/api/v1/creator/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.comics_count', 2)
            ->assertJsonPath('data.published_comics_count', 1)
            ->assertJsonPath('data.episodes_count', 3)
            ->assertJsonPath('data.published_episodes_count', 2)
            ->assertJsonPath('data.total_views', 200)
            ->assertJsonPath('data.total_likes', 10)
            ->assertJsonPath('data.total_followers', 1)
            ->assertJsonPath('data.total_comments', 1)
            ->assertJsonPath('data.rating_avg', 4.5)
            ->assertJsonPath('data.earnings.pending', 5000)
            ->assertJsonCount(3, 'data.recent_episodes')
            ->assertJsonCount(1, 'data.recent_comments')
            ->assertJsonPath('data.recent_comments.0.content', 'Keren!');
    }

    // ============ Komik Management ============

    public function test_creator_can_list_own_comics_with_stats(): void
    {
        $comic = $this->createComic($this->creator);
        $this->createEpisode($comic, 1);
        $this->createEpisode($comic, 2, Episode::STATUS_DRAFT);
        Follow::create(['user_id' => $this->reader->id, 'comic_id' => $comic->id]);

        $response = $this->withToken($this->token($this->creator))
            ->getJson('/api/v1/creator/comics');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'Komik Creator')
            ->assertJsonPath('data.0.episode_count', 2)
            ->assertJsonPath('data.0.published_episodes_count', 1)
            ->assertJsonPath('data.0.draft_episodes_count', 1)
            ->assertJsonPath('data.0.followers_count', 1)
            ->assertJsonPath('data.0.view_count', 100)
            ->assertJsonPath('data.0.like_count', 5);
    }

    public function test_creator_can_view_own_comic_with_episodes(): void
    {
        $comic = $this->createComic($this->creator);
        $this->createEpisode($comic, 1);
        $this->createEpisode($comic, 2, Episode::STATUS_DRAFT);

        $this->withToken($this->token($this->creator))
            ->getJson("/api/v1/creator/comics/{$comic->id}")
            ->assertStatus(200)
            ->assertJsonCount(2, 'data.episodes')
            ->assertJsonPath('data.episodes.0.number', 1)
            ->assertJsonPath('data.episodes.1.number', 2)
            ->assertJsonPath('data.episodes.1.status', 'draft')
            ->assertJsonPath('data.published_episodes_count', 1);
    }

    // ============ Analytics ============

    public function test_creator_can_view_comic_analytics(): void
    {
        $comic = $this->createComic($this->creator);
        $this->createEpisode($comic, 1);
        $this->createEpisode($comic, 2, Episode::STATUS_DRAFT);
        Follow::create(['user_id' => $this->reader->id, 'comic_id' => $comic->id]);
        Comment::create([
            'user_id' => $this->reader->id,
            'comic_id' => $comic->id,
            'content' => 'Seru',
            'status' => Comment::STATUS_ACTIVE,
        ]);

        $response = $this->withToken($this->token($this->creator))
            ->getJson("/api/v1/creator/comics/{$comic->id}/analytics");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.comic.title', 'Komik Creator')
            ->assertJsonPath('data.summary.views', 100)
            ->assertJsonPath('data.summary.likes', 5)
            ->assertJsonPath('data.summary.rating_avg', 4.5)
            ->assertJsonPath('data.summary.followers', 1)
            ->assertJsonPath('data.summary.comments', 1)
            ->assertJsonPath('data.summary.published_episodes', 1)
            ->assertJsonPath('data.summary.draft_episodes', 1)
            ->assertJsonCount(2, 'data.episodes')
            ->assertJsonPath('data.episodes.0.view_count', 50)
            ->assertJsonStructure([
                'data' => [
                    'comic' => ['id', 'title', 'slug', 'status'],
                    'summary' => ['views', 'likes', 'rating_avg', 'rating_count', 'followers', 'bookmarks', 'comments', 'episodes', 'published_episodes', 'draft_episodes'],
                    'episodes' => [[
                        'id', 'number', 'title', 'status', 'is_premium', 'view_count',
                        'like_count', 'page_count', 'comments_count',
                    ]],
                ],
            ]);
    }

    // ============ Profil Creator ============

    public function test_creator_can_get_own_profile(): void
    {
        $this->withToken($this->token($this->creator))
            ->getJson('/api/v1/creator/profile')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['id', 'user_id', 'display_name', 'bio', 'banner_url', 'is_verified']]);
    }

    public function test_creator_can_update_profile(): void
    {
        $response = $this->withToken($this->token($this->creator))
            ->putJson('/api/v1/creator/profile', [
                'display_name' => 'Studio Kreatif',
                'bio' => 'Membuat komik webtoon terbaik.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.display_name', 'Studio Kreatif')
            ->assertJsonPath('data.bio', 'Membuat komik webtoon terbaik.');

        $this->assertDatabaseHas('creator_profiles', [
            'user_id' => $this->creator->id,
            'display_name' => 'Studio Kreatif',
        ]);
    }

    public function test_creator_can_upload_banner(): void
    {
        Storage::fake('public');

        $response = $this->call('PUT', '/api/v1/creator/profile', [
            'display_name' => 'Studio Kreatif',
        ], [], [
            'banner' => UploadedFile::fake()->image('banner.png', 1200, 300),
        ], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$this->token($this->creator),
            'Accept' => 'application/json',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.display_name', 'Studio Kreatif')
            ->assertJsonPath('data.banner_url', fn ($url) => str_contains($url, '/storage/creator-banners/'));

        $this->assertCount(1, Storage::disk('public')->allFiles('creator-banners'));
    }

    public function test_reader_cannot_update_creator_profile(): void
    {
        $this->withToken($this->token($this->reader))
            ->putJson('/api/v1/creator/profile', ['display_name' => 'Bajak'])
            ->assertStatus(403);
    }
}
