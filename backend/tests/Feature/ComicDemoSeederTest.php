<?php

namespace Tests\Feature;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\User;
use Database\Seeders\ComicDemoSeeder;
use Database\Seeders\GenreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComicDemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seeder_creates_aligned_content(): void
    {
        User::factory()->count(3)->creator()->create();
        User::factory()->reader()->create();

        $this->seed(GenreSeeder::class);
        $this->seed(ComicDemoSeeder::class);

        // 12 komik dengan id 1–12 (selaras dengan mock frontend)
        $this->assertDatabaseCount('comics', 12);
        $this->assertSame(1, Comic::find(1)?->id);
        $this->assertSame(12, Comic::find(12)?->id);
        $this->assertSame('Bulan di Ujung Jari', Comic::find(1)?->title);

        // Setiap komik: 8 episode published (5 gratis, 3 premium @50)
        $comic = Comic::find(1);
        $this->assertSame(8, $comic->episodes()->count());
        $this->assertSame(8, $comic->publishedEpisodes()->count());
        $this->assertSame(5, $comic->episodes()->where('is_premium', false)->count());
        $this->assertSame(3, $comic->episodes()->where('is_premium', true)->count());
        $premium = $comic->episodes()->where('is_premium', true)->first();
        $this->assertSame(50, (int) $premium->price_coin);

        // Setiap episode: 10 halaman
        $episode = Episode::where('comic_id', $comic->id)->first();
        $this->assertSame(10, $episode->pages()->count());
        $this->assertDatabaseCount('episode_pages', 12 * 8 * 10);

        // Genre terpasang
        $this->assertTrue($comic->genres()->where('slug', 'fantasy')->exists());
    }

    public function test_demo_seeder_is_idempotent(): void
    {
        User::factory()->count(3)->creator()->create();

        $this->seed(GenreSeeder::class);
        $this->seed(ComicDemoSeeder::class);
        $this->seed(ComicDemoSeeder::class);

        $this->assertDatabaseCount('comics', 12);
        $this->assertDatabaseCount('episode_pages', 12 * 8 * 10);
    }
}
