<?php

namespace Tests\Feature;

use App\Models\Comic;
use App\Models\CreatorProfile;
use App\Models\Episode;
use App\Models\Follow;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCreatorProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $creator;
    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->creator = User::factory()->creator()->create([
            'username' => 'kertas',
            'name' => 'Studio Kertas',
        ]);
        $this->creator->creatorProfile()->update([
            'display_name' => 'Studio Kertas',
            'bio' => 'Studio kecil dari Yogyakarta.',
            'is_verified' => true,
        ]);

        $this->reader = User::factory()->reader()->create();
    }

    private function createComic(array $overrides = []): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $this->creator->id,
            'title' => 'Komik Kertas',
            'slug' => 'komik-kertas',
            'synopsis' => 'Sinopsis komik',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'published_at' => now(),
            'verification_status' => 'approved',
            'view_count' => 100,
            ...$overrides,
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    public function test_public_can_view_creator_profile_with_comics(): void
    {
        $comic = $this->createComic();
        $comic->episodes()->create([
            'title' => 'Episode 1',
            'number' => 1,
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
            'verification_status' => 'approved',
        ]);
        Follow::create(['comic_id' => $comic->id, 'user_id' => $this->reader->id]);

        $response = $this->getJson("/api/v1/creators/{$this->creator->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.username', 'kertas')
            ->assertJsonPath('data.display_name', 'Studio Kertas')
            ->assertJsonPath('data.bio', 'Studio kecil dari Yogyakarta.')
            ->assertJsonPath('data.is_verified', true)
            ->assertJsonPath('data.stats.total_comics', 1)
            ->assertJsonPath('data.stats.total_views', 100)
            ->assertJsonPath('data.stats.follower_count', 1)
            ->assertJsonCount(1, 'data.comics')
            ->assertJsonPath('data.comics.0.title', 'Komik Kertas');
    }

    public function test_creator_profile_hides_draft_comics(): void
    {
        $this->createComic();
        $this->createComic(['title' => 'Draft', 'slug' => 'draft', 'published_at' => null]);

        $response = $this->getJson("/api/v1/creators/{$this->creator->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.comics')
            ->assertJsonPath('data.stats.total_comics', 1);
    }

    public function test_non_creator_user_returns_404(): void
    {
        $response = $this->getJson("/api/v1/creators/{$this->reader->id}");

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_unknown_creator_returns_404(): void
    {
        $response = $this->getJson('/api/v1/creators/99999');

        $response->assertStatus(404);
    }

    public function test_creator_profile_does_not_leak_private_data(): void
    {
        $this->createComic();

        $response = $this->getJson("/api/v1/creators/{$this->creator->id}");

        $response->assertStatus(200)
            ->assertJsonMissingPath('data.email')
            ->assertJsonMissingPath('data.comics.0.creator.email');
    }
}
