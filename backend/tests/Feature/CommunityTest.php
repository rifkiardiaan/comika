<?php

namespace Tests\Feature;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityTest extends TestCase
{
    use RefreshDatabase;

    private User $creator;
    private User $reader;
    private User $otherReader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->creator = User::factory()->creator()->create();
        $this->reader = User::factory()->reader()->create();
        $this->otherReader = User::factory()->reader()->create();
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
            'title' => 'Komik Komunitas',
            'slug' => 'komik-komunitas',
            'synopsis' => 'Sinopsis komik komunitas',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'published_at' => now(),
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    private function createPublishedEpisode(Comic $comic, int $number = 1): Episode
    {
        $episode = $comic->episodes()->create([
            'title' => "Episode {$number}",
            'number' => $number,
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);
        $episode->pages()->create([
            'page_number' => 1,
            'image_url' => "comic-pages/{$episode->id}/p1.png",
        ]);

        return $episode;
    }

    // ============ Bookmark ============

    public function test_unauthenticated_cannot_bookmark(): void
    {
        $comic = $this->createComic();

        $this->postJson("/api/v1/comics/{$comic->id}/bookmark")->assertStatus(401);
    }

    public function test_reader_can_toggle_bookmark(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/bookmark")
            ->assertStatus(200)
            ->assertJsonPath('data.bookmarked', true);

        $this->assertDatabaseHas('bookmarks', [
            'user_id' => $this->reader->id,
            'comic_id' => $comic->id,
        ]);

        // Toggle off
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/bookmark")
            ->assertStatus(200)
            ->assertJsonPath('data.bookmarked', false);

        $this->assertDatabaseMissing('bookmarks', [
            'user_id' => $this->reader->id,
            'comic_id' => $comic->id,
        ]);
    }

    public function test_bookmarks_list_is_paginated_with_comic(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/bookmark")->assertStatus(200);

        $this->withToken($token)->getJson('/api/v1/me/bookmarks')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.comic.title', 'Komik Komunitas')
            ->assertJsonStructure(['data' => [['id', 'comic_id', 'comic' => ['id', 'title']]]]);
    }

    // ============ Follow ============

    public function test_reader_can_toggle_follow_and_list(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/follow")
            ->assertStatus(200)
            ->assertJsonPath('data.followed', true);

        $this->withToken($token)->getJson('/api/v1/me/follows')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.comic.title', 'Komik Komunitas');

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/follow")
            ->assertJsonPath('data.followed', false);
    }

    // ============ Like ============

    public function test_reader_can_toggle_like_on_comic(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/like")
            ->assertStatus(200)
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.like_count', 1);

        $this->assertDatabaseHas('comics', ['id' => $comic->id, 'like_count' => 1]);

        // Toggle off
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/like")
            ->assertStatus(200)
            ->assertJsonPath('data.liked', false)
            ->assertJsonPath('data.like_count', 0);

        $this->assertDatabaseHas('comics', ['id' => $comic->id, 'like_count' => 0]);
    }

    public function test_reader_can_like_episode_and_comment(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/episodes/{$episode->id}/like")
            ->assertStatus(200)
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.like_count', 1);

        // Like comment
        $comment = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'content' => 'Komentar untuk di-like',
            'status' => 'active',
        ]);

        $this->withToken($token)->postJson("/api/v1/comments/{$comment->id}/like")
            ->assertStatus(200)
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.like_count', 1);

        $this->assertDatabaseHas('comments', ['id' => $comment->id, 'like_count' => 1]);
    }

    // ============ Rating ============

    public function test_reader_can_rate_comic_and_avg_updates(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);
        $tokenOther = $this->token($this->otherReader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/rating", ['score' => 5])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.rating.score', 5)
            ->assertJsonPath('data.rating_avg', 5)
            ->assertJsonPath('data.rating_count', 1);

        // PHPUnit memakai satu container: guard sanctum ter-cache antar request,
        // reset agar request dengan token user berbeda terautentikasi dengan benar.
        \Illuminate\Support\Facades\Auth::forgetGuards();

        $this->withToken($tokenOther)->postJson("/api/v1/comics/{$comic->id}/rating", ['score' => 3])
            ->assertStatus(200)
            ->assertJsonPath('data.rating_avg', 4)
            ->assertJsonPath('data.rating_count', 2);

        // Re-rate: upsert, count tetap
        \Illuminate\Support\Facades\Auth::forgetGuards();

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/rating", ['score' => 1])
            ->assertStatus(200)
            ->assertJsonPath('data.rating_avg', 2)
            ->assertJsonPath('data.rating_count', 2);

        $this->assertDatabaseCount('ratings', 2);
    }

    public function test_rating_validation(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/rating", ['score' => 6])
            ->assertStatus(422)
            ->assertJsonValidationErrors('score');

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/rating", ['score' => 0])
            ->assertStatus(422)
            ->assertJsonValidationErrors('score');
    }

    // ============ Comment ============

    public function test_reader_can_comment_on_comic(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/comments", [
            'content' => 'Komik keren sekali!',
        ])->assertStatus(201)
            ->assertJsonPath('data.content', 'Komik keren sekali!')
            ->assertJsonPath('data.user.name', $this->reader->name);

        $this->withToken($token)->getJson("/api/v1/comics/{$comic->id}/comments")
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.content', 'Komik keren sekali!');
    }

    public function test_reader_can_reply_to_comment(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $parent = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'content' => 'Komentar utama',
            'status' => 'active',
        ]);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/comments", [
            'content' => 'Balasan saya',
            'parent_id' => $parent->id,
        ])->assertStatus(201)
            ->assertJsonPath('data.parent_id', $parent->id);

        $this->withToken($token)->getJson("/api/v1/comics/{$comic->id}/comments")
            ->assertJsonCount(1, 'data')
            ->assertJsonCount(1, 'data.0.replies')
            ->assertJsonPath('data.0.replies.0.content', 'Balasan saya');
    }

    public function test_cannot_reply_to_a_reply(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $parent = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'content' => 'Komentar utama',
            'status' => 'active',
        ]);
        $reply = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'parent_id' => $parent->id,
            'content' => 'Balasan',
            'status' => 'active',
        ]);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/comments", [
            'content' => 'Balasan balasan',
            'parent_id' => $reply->id,
        ])->assertStatus(422)
            ->assertJsonValidationErrors('parent_id');
    }

    public function test_reader_can_comment_on_published_episode(): void
    {
        $comic = $this->createComic();
        $episode = $this->createPublishedEpisode($comic);
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/episodes/{$episode->id}/comments", [
            'content' => 'Komentar di episode',
        ])->assertStatus(201)
            ->assertJsonPath('data.episode_id', $episode->id);

        $this->getJson("/api/v1/episodes/{$episode->id}/comments")
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_cannot_comment_on_draft_episode(): void
    {
        $comic = $this->createComic();
        $draft = $comic->episodes()->create([
            'title' => 'Draft',
            'number' => 1,
            'status' => Episode::STATUS_DRAFT,
        ]);
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/episodes/{$draft->id}/comments", [
            'content' => 'Bocor',
        ])->assertStatus(404);
    }

    public function test_reader_can_update_own_comment(): void
    {
        $comic = $this->createComic();
        $comment = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'content' => 'Versi awal',
            'status' => 'active',
        ]);

        $this->withToken($this->token($this->reader))
            ->putJson("/api/v1/comments/{$comment->id}", ['content' => 'Versi revisi'])
            ->assertStatus(200)
            ->assertJsonPath('data.content', 'Versi revisi');
    }

    public function test_cannot_update_others_comment(): void
    {
        $comic = $this->createComic();
        $comment = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'content' => 'Komentar orang lain',
            'status' => 'active',
        ]);

        $this->withToken($this->token($this->otherReader))
            ->putJson("/api/v1/comments/{$comment->id}", ['content' => 'Bajak'])
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_reader_can_delete_own_comment_with_replies(): void
    {
        $comic = $this->createComic();
        $comment = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'content' => 'Komentar utama',
            'status' => 'active',
        ]);
        $reply = $this->reader->comments()->create([
            'comic_id' => $comic->id,
            'parent_id' => $comment->id,
            'content' => 'Balasan',
            'status' => 'active',
        ]);

        $this->withToken($this->token($this->reader))
            ->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
        $this->assertSoftDeleted('comments', ['id' => $reply->id]);
    }

    public function test_comic_detail_includes_user_actions_when_authenticated(): void
    {
        $comic = $this->createComic();
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/bookmark")->assertStatus(200);
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/like")->assertStatus(200);
        $this->withToken($token)->postJson("/api/v1/comics/{$comic->id}/rating", ['score' => 4])->assertStatus(200);

        $this->withToken($token)->getJson("/api/v1/comics/{$comic->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.user_actions.is_bookmarked', true)
            ->assertJsonPath('data.user_actions.is_liked', true)
            ->assertJsonPath('data.user_actions.user_rating', 4);

        // Tanpa login → tidak ada user_actions
        $this->flushHeaders();
        \Illuminate\Support\Facades\Auth::forgetGuards();

        $this->getJson("/api/v1/comics/{$comic->id}")
            ->assertStatus(200)
            ->assertJsonMissingPath('data.user_actions');
    }
}
