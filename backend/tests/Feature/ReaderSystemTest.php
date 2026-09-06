<?php

namespace Tests\Feature;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReaderSystemTest extends TestCase
{
    use RefreshDatabase;

    private User $creator;
    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->creator = User::factory()->creator()->create();
        $this->reader = User::factory()->reader()->create();
    }

    private function readerToken(): string
    {
        return $this->reader->createToken('auth')->plainTextToken;
    }

    private function createComic(): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $this->creator->id,
            'title' => 'Komik Reader',
            'slug' => 'komik-reader',
            'synopsis' => 'Sinopsis komik reader',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'published_at' => now(),
            'verification_status' => 'approved',
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    private function createPublishedEpisode(Comic $comic, int $number = 1, int $pages = 3): Episode
    {
        $episode = $comic->episodes()->create([
            'title' => "Episode {$number}",
            'number' => $number,
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
            'verification_status' => 'approved',
        ]);

        for ($i = 1; $i <= $pages; $i++) {
            $episode->pages()->create([
                'page_number' => $i,
                'image_url' => "comic-pages/{$episode->id}/p{$i}.png",
            ]);
        }

        return $episode;
    }

    public function test_unauthenticated_cannot_access_history(): void
    {
        $this->getJson('/api/v1/reader/history')->assertStatus(401);
    }

    public function test_unauthenticated_cannot_record_progress(): void
    {
        $this->postJson('/api/v1/reader/progress', ['episode_id' => 1, 'last_page' => 1])
            ->assertStatus(401);
    }

    public function test_reader_can_record_progress(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);

        $response = $this->withToken($this->readerToken())
            ->postJson('/api/v1/reader/progress', [
                'episode_id' => $episode->id,
                'last_page' => 2,
                'progress' => 66.67,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.episode_id', $episode->id)
            ->assertJsonPath('data.last_page', 2)
            ->assertJsonPath('data.progress', 66.67)
            ->assertJsonPath('data.is_completed', false);

        $this->assertDatabaseHas('reading_histories', [
            'user_id' => $this->reader->id,
            'comic_id' => $comic->id,
            'episode_id' => $episode->id,
            'last_page' => 2,
        ]);
    }

    public function test_progress_upserts_single_row(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);
        $token = $this->readerToken();

        $this->withToken($token)->postJson('/api/v1/reader/progress', [
            'episode_id' => $episode->id,
            'last_page' => 1,
        ])->assertStatus(201);

        $this->withToken($token)->postJson('/api/v1/reader/progress', [
            'episode_id' => $episode->id,
            'last_page' => 3,
            'progress' => 100,
        ])->assertStatus(201)
            ->assertJsonPath('data.last_page', 3)
            ->assertJsonPath('data.progress', 100);

        $this->assertDatabaseCount('reading_histories', 1);
    }

    public function test_first_read_increments_view_counts(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);

        $this->withToken($this->readerToken())->postJson('/api/v1/reader/progress', [
            'episode_id' => $episode->id,
            'last_page' => 1,
        ])->assertStatus(201);

        $this->assertDatabaseHas('episodes', ['id' => $episode->id, 'view_count' => 1]);
        $this->assertDatabaseHas('comics', ['id' => $comic->id, 'view_count' => 1]);

        // Baca ulang tidak menambah view count (baris sudah ada)
        $this->withToken($this->readerToken())->postJson('/api/v1/reader/progress', [
            'episode_id' => $episode->id,
            'last_page' => 2,
        ])->assertStatus(201);

        $this->assertDatabaseHas('episodes', ['id' => $episode->id, 'view_count' => 1]);
    }

    public function test_reading_last_page_marks_completed(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic, 1, 3);

        $response = $this->withToken($this->readerToken())
            ->postJson('/api/v1/reader/progress', [
                'episode_id' => $episode->id,
                'last_page' => 3,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.progress', 100)
            ->assertJsonPath('data.is_completed', true);
    }

    public function test_progress_over_100_is_rejected(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);

        $this->withToken($this->readerToken())
            ->postJson('/api/v1/reader/progress', [
                'episode_id' => $episode->id,
                'last_page' => 5,
                'progress' => 150,
            ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors('progress');
    }

    public function test_cannot_record_progress_on_draft_episode(): void
    {
        $comic = $this->createComic();
        $draft = $comic->episodes()->create([
            'title' => 'Draft',
            'number' => 1,
            'status' => Episode::STATUS_DRAFT,
        ]);

        $this->withToken($this->readerToken())
            ->postJson('/api/v1/reader/progress', [
                'episode_id' => $draft->id,
                'last_page' => 1,
            ])
            ->assertStatus(404);
    }

    public function test_history_lists_records_with_comic_and_episode(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);
        $token = $this->readerToken();

        $this->withToken($token)->postJson('/api/v1/reader/progress', [
            'episode_id' => $episode->id,
            'last_page' => 2,
        ])->assertStatus(201);

        $response = $this->withToken($token)
            ->getJson('/api/v1/reader/history');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonStructure([
                'data' => [[
                    'id', 'comic_id', 'episode_id', 'last_page', 'progress', 'is_completed',
                    'comic' => ['id', 'title', 'slug', 'cover_url', 'episode_count'],
                    'episode' => ['id', 'number', 'title', 'page_count'],
                ]],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_history_orders_by_recently_read(): void
    {
        $comic = $this->createComic();
        $first = $this->createPublishedEpisode($comic, 1);
        $second = $this->createPublishedEpisode($comic, 2);
        $token = $this->readerToken();

        $this->withToken($token)->postJson('/api/v1/reader/progress', [
            'episode_id' => $first->id, 'last_page' => 1,
        ])->assertStatus(201);

        $this->withToken($token)->postJson('/api/v1/reader/progress', [
            'episode_id' => $second->id, 'last_page' => 1,
        ])->assertStatus(201);

        $response = $this->withToken($token)->getJson('/api/v1/reader/history');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.episode_id', $second->id)
            ->assertJsonPath('data.1.episode_id', $first->id);
    }

    public function test_comic_detail_includes_user_progress_when_authenticated(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic, 1);
        $token = $this->readerToken();

        $this->withToken($token)->postJson('/api/v1/reader/progress', [
            'episode_id' => $episode->id, 'last_page' => 2,
        ])->assertStatus(201);

        $this->withToken($token)
            ->getJson("/api/v1/comics/{$comic->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.user_progress.episode_id', $episode->id)
            ->assertJsonPath('data.user_progress.last_page', 2)
            ->assertJsonPath('data.user_progress.progress', 66.67);

        // Tanpa login → tidak ada user_progress.
        // PHPUnit memakai satu container & test client menyimpan header:
        // - flushHeaders()  → buang Authorization dari request berikutnya
        // - forgetGuards()  → buang user yang ter-cache di guard sanctum
        $this->flushHeaders();
        \Illuminate\Support\Facades\Auth::forgetGuards();

        $this->getJson("/api/v1/comics/{$comic->id}")
            ->assertStatus(200)
            ->assertJsonMissingPath('data.user_progress');
    }

    public function test_episode_detail_includes_prev_next_navigation(): void
    {
        $comic = $this->createComic();
        $this->createPublishedEpisode($comic, 1);
        $middle = $this->createPublishedEpisode($comic, 2);
        $this->createPublishedEpisode($comic, 3);

        $response = $this->getJson("/api/v1/episodes/{$middle->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.prev.number', 1)
            ->assertJsonPath('data.next.number', 3)
            ->assertJsonPath('data.pages.0.page_number', 1);
    }

    public function test_first_and_last_episode_have_null_navigation(): void
    {
        $comic = $this->createComic();
        $first = $this->createPublishedEpisode($comic, 1);
        $last = $this->createPublishedEpisode($comic, 2);

        $this->getJson("/api/v1/episodes/{$first->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.prev', null)
            ->assertJsonPath('data.next.number', 2);

        $this->getJson("/api/v1/episodes/{$last->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.prev.number', 1)
            ->assertJsonPath('data.next', null);
    }
}
