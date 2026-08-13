<?php

namespace Tests\Feature;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ComicCoreTest extends TestCase
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

    private function creatorToken(): string
    {
        return $this->creator->createToken('auth')->plainTextToken;
    }

    private function readerToken(): string
    {
        return $this->reader->createToken('auth')->plainTextToken;
    }

    private function createComic(array $overrides = []): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $this->creator->id,
            'title' => 'Komik Baru',
            'slug' => 'komik-baru',
            'synopsis' => 'Sinopsis komik',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'published_at' => now(),
            ...$overrides,
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    public function test_genres_list_is_public(): void
    {
        Genre::create(['slug' => 'romance', 'name' => 'Romance']);

        $response = $this->getJson('/api/v1/genres');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => [['id', 'slug', 'name']]]);
    }

    public function test_comics_list_is_public_and_paginated(): void
    {
        $this->createComic();

        $response = $this->getJson('/api/v1/comics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'Komik Baru');
    }

    public function test_creator_can_create_comic(): void
    {
        Storage::fake('public');
        $genre = Genre::create(['slug' => 'fantasy', 'name' => 'Fantasy']);

        $response = $this->withToken($this->creatorToken())
            ->postJson('/api/v1/comics', [
                'title' => 'Petualangan Luar Angkasa',
                'synopsis' => 'Cerita petualangan di luar angkasa.',
                'genres' => [$genre->id],
                'cover' => UploadedFile::fake()->image('cover.png', 400, 600),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Petualangan Luar Angkasa')
            ->assertJsonPath('data.slug', 'petualangan-luar-angkasa');

        $this->assertDatabaseHas('comics', ['slug' => 'petualangan-luar-angkasa']);
        // store() menghasilkan nama file acak — pastikan folder berisi file
        $this->assertCount(1, Storage::disk('public')->allFiles('comic-covers'));
        $this->assertDatabaseMissing('comics', ['cover_url' => null]);
    }

    public function test_reader_cannot_create_comic(): void
    {
        $genre = Genre::create(['slug' => 'action', 'name' => 'Action']);

        $response = $this->withToken($this->readerToken())
            ->postJson('/api/v1/comics', [
                'title' => 'Komik Reader',
                'synopsis' => 'Tidak boleh.',
                'genres' => [$genre->id],
            ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_create_comic(): void
    {
        $response = $this->postJson('/api/v1/comics', [
            'title' => 'Tanpa Login',
            'synopsis' => 'Tidak boleh.',
            'genres' => [],
        ]);

        $response->assertStatus(401);
    }

    public function test_creator_can_update_own_comic(): void
    {
        $comic = $this->createComic();

        $response = $this->withToken($this->creatorToken())
            ->putJson("/api/v1/comics/{$comic->id}", [
                'title' => 'Judul Baru',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Judul Baru')
            ->assertJsonPath('data.slug', 'judul-baru');
    }

    public function test_creator_cannot_update_others_comic(): void
    {
        $other = User::factory()->creator()->create();
        $comic = $this->createComic();

        $response = $this->withToken($other->createToken('auth')->plainTextToken)
            ->putJson("/api/v1/comics/{$comic->id}", ['title' => 'Bajak']);

        $response->assertStatus(403);
    }

    public function test_creator_can_delete_own_comic(): void
    {
        $comic = $this->createComic();

        $response = $this->withToken($this->creatorToken())
            ->deleteJson("/api/v1/comics/{$comic->id}");

        $response->assertStatus(200)->assertJsonPath('success', true);
        $this->assertSoftDeleted('comics', ['id' => $comic->id]);
    }

    public function test_creator_can_create_and_publish_episode(): void
    {
        Storage::fake('public');
        $comic = $this->createComic();

        $create = $this->withToken($this->creatorToken())
            ->postJson("/api/v1/comics/{$comic->id}/episodes", [
                'title' => 'Episode 1: Awal',
            ]);

        $create->assertStatus(201)
            ->assertJsonPath('data.title', 'Episode 1: Awal')
            ->assertJsonPath('data.number', 1)
            ->assertJsonPath('data.status', 'draft');

        $episodeId = $create->json('data.id');

        // Upload pages
        $upload = $this->withToken($this->creatorToken())
            ->postJson("/api/v1/episodes/{$episodeId}/pages", [
                'pages' => [
                    UploadedFile::fake()->image('p1.png'),
                    UploadedFile::fake()->image('p2.png'),
                ],
            ]);

        $upload->assertStatus(201)
            ->assertJsonPath('data.0.page_number', 1)
            ->assertJsonPath('data.1.page_number', 2);

        // Publish
        $publish = $this->withToken($this->creatorToken())
            ->postJson("/api/v1/episodes/{$episodeId}/publish");

        $publish->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        $this->assertDatabaseHas('episodes', [
            'id' => $episodeId,
            'status' => 'published',
        ]);
    }

    public function test_cannot_publish_episode_without_pages(): void
    {
        $comic = $this->createComic();
        $episode = $comic->episodes()->create([
            'title' => 'Kosong',
            'number' => 1,
            'status' => Episode::STATUS_DRAFT,
        ]);

        $response = $this->withToken($this->creatorToken())
            ->postJson("/api/v1/episodes/{$episode->id}/publish");

        $response->assertStatus(422);
    }

    public function test_reader_cannot_manage_episodes(): void
    {
        $comic = $this->createComic();

        $response = $this->withToken($this->readerToken())
            ->postJson("/api/v1/comics/{$comic->id}/episodes", [
                'title' => 'Bajak Episode',
            ]);

        $response->assertStatus(403);
    }

    public function test_public_can_read_comic_detail_with_episodes(): void
    {
        $comic = $this->createComic();
        $comic->episodes()->create([
            'title' => 'Episode 1',
            'number' => 1,
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        $response = $this->getJson("/api/v1/comics/{$comic->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Komik Baru')
            ->assertJsonCount(1, 'data.episodes');
    }

    public function test_public_detail_hides_draft_episodes(): void
    {
        $comic = $this->createComic();
        $comic->episodes()->create([
            'title' => 'Draft',
            'number' => 1,
            'status' => Episode::STATUS_DRAFT,
        ]);

        $response = $this->getJson("/api/v1/comics/{$comic->id}");

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.episodes');
    }

    public function test_duplicate_episode_number_is_rejected(): void
    {
        $comic = $this->createComic();
        $comic->episodes()->create([
            'title' => 'Episode 1',
            'number' => 1,
            'status' => Episode::STATUS_DRAFT,
        ]);

        $response = $this->withToken($this->creatorToken())
            ->postJson("/api/v1/comics/{$comic->id}/episodes", [
                'title' => 'Duplikat',
                'number' => 1,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors('number');
    }

    public function test_policy_denial_returns_consistent_format(): void
    {
        $other = User::factory()->creator()->create();
        $comic = $this->createComic();

        $response = $this->withToken($other->createToken('auth')->plainTextToken)
            ->putJson("/api/v1/comics/{$comic->id}", ['title' => 'Bajak']);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['message', 'errors']);
    }

    public function test_slug_fallback_for_symbol_only_title(): void
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $response = $this->withToken($this->creatorToken())
            ->postJson('/api/v1/comics', [
                'title' => '!!!',
                'synopsis' => 'Judul simbol.',
                'genres' => [$genre->id],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.slug', 'untitled');
    }
}
