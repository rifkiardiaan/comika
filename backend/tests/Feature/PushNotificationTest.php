<?php

namespace Tests\Feature;

use App\Models\PushSubscription;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\WebPushService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PushNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reader = User::factory()->reader()->create();
    }

    private function token(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    private function subscriptionPayload(string $endpoint = 'https://fcm.example.com/send/abc-123'): array
    {
        return [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'BC8k-test-p256dh-key-base64url',
                'auth' => 'test-auth-secret-base64url',
            ],
        ];
    }

    // ============ Autentikasi & konfigurasi ============

    public function test_unauthenticated_cannot_access_push_endpoints(): void
    {
        $this->getJson('/api/v1/me/push/subscriptions')->assertStatus(401);
        $this->postJson('/api/v1/me/push/subscribe')->assertStatus(401);
        $this->deleteJson('/api/v1/me/push/subscribe')->assertStatus(401);
    }

    public function test_vapid_public_key_returns_503_when_not_configured(): void
    {
        $this->getJson('/api/v1/push/vapid-public-key')
            ->assertStatus(503)
            ->assertJsonPath('success', false);
    }

    public function test_vapid_public_key_returns_key_when_configured(): void
    {
        config(['services.webpush.vapid.public_key' => 'test-public-key-base64url']);

        $this->getJson('/api/v1/push/vapid-public-key')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.public_key', 'test-public-key-base64url');
    }

    public function test_subscribe_rejected_when_not_configured(): void
    {
        $this->withToken($this->token($this->reader))
            ->postJson('/api/v1/me/push/subscribe', $this->subscriptionPayload())
            ->assertStatus(503);
    }

    // ============ Subscribe / unsubscribe ============

    public function test_subscribe_stores_subscription(): void
    {
        config(['services.webpush.vapid.public_key' => 'key', 'services.webpush.vapid.private_key' => 'secret']);

        $this->withToken($this->token($this->reader))
            ->postJson('/api/v1/me/push/subscribe', $this->subscriptionPayload())
            ->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $this->reader->id,
            'endpoint' => 'https://fcm.example.com/send/abc-123',
        ]);

        $subscription = PushSubscription::firstOrFail();
        $this->assertSame('BC8k-test-p256dh-key-base64url', $subscription->keys['p256dh']);
        $this->assertSame('test-auth-secret-base64url', $subscription->keys['auth']);
    }

    public function test_subscribe_requires_valid_keys(): void
    {
        config(['services.webpush.vapid.public_key' => 'key', 'services.webpush.vapid.private_key' => 'secret']);

        $this->withToken($this->token($this->reader))
            ->postJson('/api/v1/me/push/subscribe', [
                'endpoint' => 'bukan-url',
                'keys' => ['p256dh' => ''],
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('push_subscriptions', 0);
    }

    public function test_subscribe_same_endpoint_upserts_to_current_user(): void
    {
        config(['services.webpush.vapid.public_key' => 'key', 'services.webpush.vapid.private_key' => 'secret']);

        $other = User::factory()->reader()->create();
        $endpoint = 'https://fcm.example.com/send/upsert-1';

        // Dulu milik user lain
        PushSubscription::create([
            'user_id' => $other->id,
            'endpoint' => $endpoint,
            'keys' => ['p256dh' => 'old', 'auth' => 'old-auth'],
        ]);

        $this->withToken($this->token($this->reader))
            ->postJson('/api/v1/me/push/subscribe', $this->subscriptionPayload($endpoint))
            ->assertStatus(201);

        $this->assertDatabaseCount('push_subscriptions', 1);
        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $this->reader->id,
            'endpoint' => $endpoint,
        ]);
    }

    public function test_index_returns_only_own_subscriptions(): void
    {
        config(['services.webpush.vapid.public_key' => 'key', 'services.webpush.vapid.private_key' => 'secret']);

        PushSubscription::create([
            'user_id' => $this->reader->id,
            'endpoint' => 'https://fcm.example.com/send/milik-saya',
            'keys' => ['p256dh' => 'a', 'auth' => 'b'],
        ]);

        $other = User::factory()->reader()->create();
        PushSubscription::create([
            'user_id' => $other->id,
            'endpoint' => 'https://fcm.example.com/send/milik-orang',
            'keys' => ['p256dh' => 'c', 'auth' => 'd'],
        ]);

        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/push/subscriptions')
            ->assertStatus(200)
            ->assertJsonPath('data.configured', true)
            ->assertJsonCount(1, 'data.subscriptions')
            ->assertJsonPath('data.subscriptions.0.endpoint', 'https://fcm.example.com/send/milik-saya');
    }

    public function test_unsubscribe_removes_own_subscription(): void
    {
        config(['services.webpush.vapid.public_key' => 'key', 'services.webpush.vapid.private_key' => 'secret']);

        $endpoint = 'https://fcm.example.com/send/hapus-saya';
        PushSubscription::create([
            'user_id' => $this->reader->id,
            'endpoint' => $endpoint,
            'keys' => ['p256dh' => 'a', 'auth' => 'b'],
        ]);

        $this->withToken($this->token($this->reader))
            ->deleteJson('/api/v1/me/push/subscribe', ['endpoint' => $endpoint])
            ->assertStatus(200)
            ->assertJsonPath('data.deleted', 1);

        $this->assertDatabaseCount('push_subscriptions', 0);
    }

    public function test_unsubscribe_cannot_delete_other_users_subscription(): void
    {
        config(['services.webpush.vapid.public_key' => 'key', 'services.webpush.vapid.private_key' => 'secret']);

        $other = User::factory()->reader()->create();
        $endpoint = 'https://fcm.example.com/send/milik-lain';
        PushSubscription::create([
            'user_id' => $other->id,
            'endpoint' => $endpoint,
            'keys' => ['p256dh' => 'a', 'auth' => 'b'],
        ]);

        $this->withToken($this->token($this->reader))
            ->deleteJson('/api/v1/me/push/subscribe', ['endpoint' => $endpoint])
            ->assertStatus(200)
            ->assertJsonPath('data.deleted', 0);

        $this->assertDatabaseCount('push_subscriptions', 1);
    }

    // ============ Integrasi NotificationService ============

    public function test_send_dispatches_web_push_with_mapped_payload(): void
    {
        $mock = $this->mock(WebPushService::class);
        $mock->shouldReceive('sendToUser')
            ->once()
            ->withArgs(function ($userId, $title, $body, $data) {
                return $userId === $this->reader->id
                    && $title === 'Episode 5 — Bab Baru'
                    && $body === 'Episode baru dari Komik Aksi'
                    && $data['url'] === '/comic/comic-1/episode/ep-1'
                    && $data['type'] === 'new_episode';
            })
            ->andReturn(1);

        app(NotificationService::class)->send($this->reader, 'new_episode', [
            'comic_id' => 'comic-1',
            'comic_title' => 'Komik Aksi',
            'episode_id' => 'ep-1',
            'episode_number' => 5,
            'episode_title' => 'Bab Baru',
        ]);

        // Notifikasi in-app tetap tersimpan
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->reader->id,
            'type' => 'new_episode',
        ]);
    }

    public function test_send_works_without_webpush_configured(): void
    {
        $notification = app(NotificationService::class)->send($this->reader, 'system', ['msg' => 'tanpa push']);

        $this->assertNotNull($notification->id);
        $this->assertDatabaseHas('notifications', ['id' => $notification->id]);
    }

    public function test_push_failure_does_not_break_notification_creation(): void
    {
        $mock = $this->mock(WebPushService::class);
        $mock->shouldReceive('sendToUser')
            ->once()
            ->andThrow(new \RuntimeException('VAPID error'));

        $notification = app(NotificationService::class)->send($this->reader, 'system', ['msg' => 'ok']);

        $this->assertNotNull($notification->id);
        $this->assertDatabaseHas('notifications', ['id' => $notification->id]);
    }

    public function test_send_to_user_returns_zero_when_not_configured(): void
    {
        $service = app(WebPushService::class);

        $this->assertFalse($service->isConfigured());
        $this->assertSame(0, $service->sendToUser($this->reader, 'Judul', 'Isi'));
    }

    public function test_send_to_user_returns_zero_without_subscriptions(): void
    {
        config(['services.webpush.vapid.public_key' => 'key', 'services.webpush.vapid.private_key' => 'secret']);

        $service = app(WebPushService::class);

        $this->assertSame(0, $service->sendToUser($this->reader, 'Judul', 'Isi'));
    }

    public function test_push_subscriptions_cascade_on_user_delete(): void
    {
        PushSubscription::create([
            'user_id' => $this->reader->id,
            'endpoint' => 'https://fcm.example.com/send/cascade',
            'keys' => ['p256dh' => 'a', 'auth' => 'b'],
        ]);

        $this->reader->forceDelete();

        $this->assertDatabaseCount('push_subscriptions', 0);
    }
}
