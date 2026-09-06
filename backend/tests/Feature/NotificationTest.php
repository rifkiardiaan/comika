<?php

namespace Tests\Feature;

use App\Models\Comic;
use App\Models\Comment;
use App\Models\Episode;
use App\Models\Follow;
use App\Models\Genre;
use App\Models\Notification;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class NotificationTest extends TestCase
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

        // Mock MidtransService untuk testing
        $midtransMock = Mockery::mock(MidtransService::class);
        $midtransMock->shouldReceive('createSnapToken')->andReturn([
            'token' => 'fake-snap-token-' . time(),
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/vtweb/fake-token',
        ]);
        $this->app->instance(MidtransService::class, $midtransMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function token(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    private function adminToken(): string
    {
        \Illuminate\Support\Facades\Auth::forgetGuards();

        return $this->token($this->admin);
    }

    private function createComic(): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $this->creator->id,
            'title' => 'Komik Notifikasi',
            'slug' => 'komik-notifikasi',
            'synopsis' => 'Sinopsis komik notifikasi',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'published_at' => now(),
            'verification_status' => 'approved',
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    private function createDraftEpisode(Comic $comic, int $number = 1, int $pages = 2): Episode
    {
        $episode = $comic->episodes()->create([
            'title' => "Episode {$number}",
            'number' => $number,
            'status' => Episode::STATUS_DRAFT,
            'is_premium' => false,
            'price_coin' => 0,
        ]);

        for ($i = 1; $i <= $pages; $i++) {
            $episode->pages()->create([
                'page_number' => $i,
                'image_url' => "comic-pages/{$episode->id}/p{$i}.png",
            ]);
        }

        return $episode;
    }

    private function notify(User $user, string $type = 'system', array $data = [], ?\Illuminate\Support\Carbon $createdAt = null): Notification
    {
        return Notification::forceCreate([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'type' => $type,
            'data' => $data,
            'created_at' => $createdAt ?? now(),
        ]);
    }

    // ============ Autentikasi & Otorisasi ============

    public function test_unauthenticated_cannot_access_notifications(): void
    {
        $this->getJson('/api/v1/me/notifications')->assertStatus(401);
        $this->getJson('/api/v1/me/notifications/unread-count')->assertStatus(401);
        $this->postJson('/api/v1/me/notifications/read-all')->assertStatus(401);
        $this->putJson('/api/v1/me/notifications/some-id/read')->assertStatus(401);
    }

    public function test_user_cannot_read_or_delete_other_users_notification(): void
    {
        $notification = $this->notify($this->creator);

        $this->withToken($this->token($this->reader))
            ->putJson("/api/v1/me/notifications/{$notification->id}/read")
            ->assertStatus(404);

        $this->withToken($this->token($this->reader))
            ->deleteJson("/api/v1/me/notifications/{$notification->id}")
            ->assertStatus(404);

        // Notifikasi milik creator tidak berubah
        $this->assertNull($notification->fresh()->read_at);
        $this->assertDatabaseCount('notifications', 1);
    }

    // ============ API Notifikasi ============

    public function test_index_returns_only_own_notifications_newest_first(): void
    {
        $this->notify($this->creator, 'system', ['msg' => 'punya creator']);
        $first = $this->notify($this->reader, 'system', ['msg' => 'pertama'], now()->subMinutes(5));
        $second = $this->notify($this->reader, 'new_episode', ['comic_title' => 'Terbaru']);

        $response = $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $second->id)
            ->assertJsonPath('data.1.id', $first->id)
            ->assertJsonPath('data.0.type', 'new_episode')
            ->assertJsonPath('data.0.data.comic_title', 'Terbaru')
            ->assertJsonPath('data.0.read_at', null)
            ->assertJsonMissingPath('data.0.id.0'); // tidak ada notifikasi user lain
    }

    public function test_unread_count(): void
    {
        $this->notify($this->reader);
        $this->notify($this->reader);

        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/notifications/unread-count')
            ->assertStatus(200)
            ->assertJsonPath('data.unread_count', 2);
    }

    public function test_mark_single_notification_read(): void
    {
        $notification = $this->notify($this->reader);

        $response = $this->withToken($this->token($this->reader))
            ->putJson("/api/v1/me/notifications/{$notification->id}/read")
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $notification->id);

        $this->assertNotNull($response->json('data.read_at'));
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_mark_all_notifications_read(): void
    {
        $this->notify($this->reader);
        $this->notify($this->reader);
        $this->notify($this->creator); // milik user lain tidak terpengaruh

        $this->withToken($this->token($this->reader))
            ->postJson('/api/v1/me/notifications/read-all')
            ->assertStatus(200)
            ->assertJsonPath('data.updated', 2);

        $this->assertDatabaseHas('notifications', ['user_id' => $this->reader->id, 'read_at' => now()]);
        $this->assertDatabaseHas('notifications', ['user_id' => $this->creator->id, 'read_at' => null]);
    }

    public function test_delete_notification(): void
    {
        $notification = $this->notify($this->reader);

        $this->withToken($this->token($this->reader))
            ->deleteJson("/api/v1/me/notifications/{$notification->id}")
            ->assertStatus(200);

        $this->assertDatabaseCount('notifications', 0);
    }

    // ============ Event Otomatis ============

    public function test_publishing_episode_notifies_comic_followers(): void
    {
        $comic = $this->createComic();
        $episode = $this->createDraftEpisode($comic, 1);

        Follow::create(['user_id' => $this->reader->id, 'comic_id' => $comic->id]);

        // Alur moderasi: episode diterbitkan oleh ADMIN (creator hanya
        // mengirim ke review). Follower mendapat notifikasi episode baru.
        $this->withToken($this->adminToken())
            ->postJson("/api/v1/admin/episodes/{$episode->id}/publish")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->reader->id,
            'type' => 'new_episode',
        ]);

        $notification = Notification::where('user_id', $this->reader->id)->firstOrFail();
        $this->assertSame($comic->id, $notification->data['comic_id']);
        $this->assertSame($episode->id, $notification->data['episode_id']);
    }

    public function test_publishing_episode_does_not_notify_creator_or_non_followers(): void
    {
        $comic = $this->createComic();
        $episode = $this->createDraftEpisode($comic, 1);

        $this->withToken($this->token($this->creator))
            ->postJson("/api/v1/episodes/{$episode->id}/publish")
            ->assertStatus(200);

        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_replying_to_comment_notifies_parent_author(): void
    {
        $comic = $this->createComic();
        $parent = Comment::create([
            'user_id' => $this->creator->id,
            'comic_id' => $comic->id,
            'content' => 'Komentar utama',
            'status' => Comment::STATUS_ACTIVE,
        ]);

        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/comics/{$comic->id}/comments", [
                'content' => 'Balasan kamu',
                'parent_id' => $parent->id,
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->creator->id,
            'type' => 'comment_reply',
        ]);

        $notification = Notification::where('user_id', $this->creator->id)->firstOrFail();
        $this->assertSame($comic->id, $notification->data['comic_id']);
    }

    public function test_replying_to_own_comment_does_not_notify_self(): void
    {
        $comic = $this->createComic();
        $parent = Comment::create([
            'user_id' => $this->reader->id,
            'comic_id' => $comic->id,
            'content' => 'Komentar sendiri',
            'status' => Comment::STATUS_ACTIVE,
        ]);

        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/comics/{$comic->id}/comments", [
                'content' => 'Balasan sendiri',
                'parent_id' => $parent->id,
            ])
            ->assertStatus(201);

        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_admin_changing_comic_status_notifies_creator(): void
    {
        $comic = $this->createComic();

        $this->withToken($this->adminToken())
            ->patchJson("/api/v1/admin/comics/{$comic->id}/status", ['status' => 'completed'])
            ->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->creator->id,
            'type' => 'comic_update',
        ]);

        $notification = Notification::where('user_id', $this->creator->id)->firstOrFail();
        $this->assertSame('completed', $notification->data['status']);
    }

    public function test_admin_withdrawal_status_change_notifies_creator(): void
    {
        $comic = $this->createComic();
        $episode = $this->createDraftEpisode($comic, 1);

        // Saldo earnings cukup: buat earning pending dulu
        \App\Models\CreatorEarning::create([
            'creator_id' => $this->creator->id,
            'episode_id' => $episode->id,
            'amount' => 10000,
            'status' => \App\Models\CreatorEarning::STATUS_PENDING,
        ]);

        $withdrawalId = $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/creator/withdrawals', [
                'amount' => 10000,
                'bank_name' => 'BCA',
                'bank_account' => '1234567890',
                'bank_holder' => 'Studio Kertas',
            ])->json('data.id');

        $this->withToken($this->adminToken())
            ->patchJson("/api/v1/admin/withdrawals/{$withdrawalId}/status", [
                'status' => 'approved',
                'admin_note' => 'Diproses.',
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->creator->id,
            'type' => 'transaction',
        ]);

        $notification = Notification::where('user_id', $this->creator->id)->firstOrFail();
        $this->assertSame('approved', $notification->data['status']);
    }

    public function test_coin_purchase_creates_pending_transaction(): void
    {
        $package = \App\Models\CoinPackage::create([
            'name' => 'Paket 100 Koin',
            'coins' => 100,
            'price' => 15000,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/coin-packages/{$package->id}/purchase");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['snap_token', 'order_id']]);

        // Transaksi pending dibuat
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->reader->id,
            'type' => 'coin_purchase',
            'coins' => 100,
            'status' => 'pending',
        ]);
    }
}
