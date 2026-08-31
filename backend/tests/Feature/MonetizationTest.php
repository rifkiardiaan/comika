<?php

namespace Tests\Feature;

use App\Models\CoinPackage;
use App\Models\Comic;
use App\Models\CreatorEarning;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\User;
use App\Models\Wallet;
use App\Services\MidtransService;
use App\Services\MonetizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class MonetizationTest extends TestCase
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
        // Sanctum meng-cache user per guard dalam satu test —
        // reset guard sebelum beralih dari user lain ke admin.
        \Illuminate\Support\Facades\Auth::forgetGuards();

        return $this->token($this->admin);
    }

    private function createComic(): Comic
    {
        $genre = Genre::firstOrCreate(['slug' => 'action'], ['name' => 'Action']);

        $comic = Comic::create([
            'creator_id' => $this->creator->id,
            'title' => 'Komik Monetisasi',
            'slug' => 'komik-monetisasi',
            'synopsis' => 'Sinopsis komik monetisasi',
            'status' => Comic::STATUS_ONGOING,
            'age_rating' => Comic::AGE_TEEN,
            'published_at' => now(),
        ]);
        $comic->genres()->attach($genre->id);

        return $comic;
    }

    private function createEpisode(Comic $comic, int $number = 1, bool $premium = false, int $price = 0, int $pages = 3): Episode
    {
        $episode = $comic->episodes()->create([
            'title' => "Episode {$number}",
            'number' => $number,
            'status' => Episode::STATUS_PUBLISHED,
            'is_premium' => $premium,
            'price_coin' => $price,
            'published_at' => now(),
        ]);

        for ($i = 1; $i <= $pages; $i++) {
            $episode->pages()->create([
                'page_number' => $i,
                'image_url' => "comic-pages/{$episode->id}/p{$i}.png",
            ]);
        }

        return $episode;
    }

    private function createPackage(int $coins = 100, float $price = 15000, bool $active = true): CoinPackage
    {
        return CoinPackage::create([
            'name' => "Paket {$coins} Koin",
            'coins' => $coins,
            'price' => $price,
            'is_active' => $active,
        ]);
    }

    private function fund(User $user, int $coins): void
    {
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id], ['coin_balance' => 0]);
        $wallet->increment('coin_balance', $coins);
        $user->update(['coin_balance' => $wallet->fresh()->coin_balance]);
    }

    private function createPendingEarning(int $amount): CreatorEarning
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic);

        return CreatorEarning::create([
            'creator_id' => $this->creator->id,
            'episode_id' => $episode->id,
            'amount' => $amount,
            'status' => CreatorEarning::STATUS_PENDING,
        ]);
    }

    // ============ Autentikasi & Otorisasi ============

    public function test_unauthenticated_cannot_access_monetization_endpoints(): void
    {
        $this->getJson('/api/v1/me/wallet')->assertStatus(401);
        $this->getJson('/api/v1/me/transactions')->assertStatus(401);
        $this->postJson('/api/v1/episodes/1/unlock')->assertStatus(401);

        $package = $this->createPackage();
        $this->postJson("/api/v1/coin-packages/{$package->id}/purchase")->assertStatus(401);
    }

    public function test_reader_cannot_access_creator_earnings(): void
    {
        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/creator/earnings')
            ->assertStatus(403);
    }

    public function test_creator_cannot_access_admin_transactions(): void
    {
        $this->withToken($this->token($this->creator))
            ->getJson('/api/v1/admin/transactions')
            ->assertStatus(403);
    }

    // ============ Paket Koin ============

    public function test_public_can_list_active_coin_packages(): void
    {
        $this->createPackage(100, 15000);
        $this->createPackage(300, 42000);
        $this->createPackage(700, 90000, false); // tidak aktif, tidak muncul

        $response = $this->getJson('/api/v1/coin-packages');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.coins', 100)
            ->assertJsonPath('data.0.price', 15000);
    }

    public function test_reader_can_purchase_coin_package(): void
    {
        $package = $this->createPackage(100, 15000);

        $response = $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/coin-packages/{$package->id}/purchase");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => ['snap_token', 'redirect_url', 'order_id', 'transaction_id'],
            ]);

        // Transaksi pending dibuat (belum success — menunggu Midtrans webhook)
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->reader->id,
            'type' => 'coin_purchase',
            'coins' => 100,
            'status' => 'pending',
            'payment_method' => 'midtrans',
        ]);
    }

    public function test_cannot_purchase_inactive_package(): void
    {
        $package = $this->createPackage(100, 15000, false);

        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/coin-packages/{$package->id}/purchase")
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('transactions', 0);
    }

    // ============ Unlock Episode Premium ============

    public function test_reader_can_unlock_premium_episode(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 500);

        $response = $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/episodes/{$episode->id}/unlock");

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_unlocked', true)
            ->assertJsonPath('data.balance', 450)
            ->assertJsonPath('data.unlock.coins_spent', 50);

        $this->assertDatabaseHas('episode_unlocks', [
            'user_id' => $this->reader->id,
            'episode_id' => $episode->id,
            'coins_spent' => 50,
        ]);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->reader->id,
            'type' => 'episode_unlock',
            'coins' => 50,
            'status' => 'success',
        ]);
        // Earning creator: 50 koin × Rp100 × 60% = Rp 3.000 (pending)
        $this->assertDatabaseHas('creator_earnings', [
            'creator_id' => $this->creator->id,
            'episode_id' => $episode->id,
            'amount' => 3000.0,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('users', ['id' => $this->reader->id, 'coin_balance' => 450]);
    }

    public function test_unlock_fails_when_balance_insufficient(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 30);

        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/episodes/{$episode->id}/unlock")
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('episode_unlocks', 0);
        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseHas('wallets', ['user_id' => $this->reader->id, 'coin_balance' => 30]);
    }

    public function test_unlock_twice_is_idempotent_and_free(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 500);
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/episodes/{$episode->id}/unlock")->assertStatus(201);

        $this->withToken($token)
            ->postJson("/api/v1/episodes/{$episode->id}/unlock")
            ->assertStatus(200)
            ->assertJsonPath('data.is_unlocked', true)
            ->assertJsonPath('data.balance', 450);

        $this->assertDatabaseCount('episode_unlocks', 1);
        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_cannot_unlock_free_episode(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 1, false, 0);

        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/episodes/{$episode->id}/unlock")
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_cannot_unlock_draft_episode(): void
    {
        $comic = $this->createComic();
        $draft = $comic->episodes()->create([
            'title' => 'Draft Premium',
            'number' => 5,
            'status' => Episode::STATUS_DRAFT,
            'is_premium' => true,
            'price_coin' => 50,
        ]);
        $this->fund($this->reader, 500);

        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/episodes/{$draft->id}/unlock")
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_creator_reading_own_premium_episode_is_free(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);

        $response = $this->withToken($this->token($this->creator))
            ->postJson("/api/v1/episodes/{$episode->id}/unlock");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_unlocked', true)
            ->assertJsonPath('data.unlock', null);

        $this->assertDatabaseCount('episode_unlocks', 0);
        $this->assertDatabaseCount('transactions', 0);
    }

    // ============ Gate Premium di Detail & Daftar Episode ============

    public function test_premium_episode_locked_for_reader_without_unlock(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);

        $response = $this->withToken($this->token($this->reader))
            ->getJson("/api/v1/episodes/{$episode->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_locked', true)
            ->assertJsonPath('data.is_unlocked', false)
            ->assertJsonPath('data.pages', []);
    }

    public function test_premium_episode_unlocked_after_purchase(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 500);
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/episodes/{$episode->id}/unlock")->assertStatus(201);

        $response = $this->withToken($token)
            ->getJson("/api/v1/episodes/{$episode->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_unlocked', true)
            ->assertJsonMissingPath('data.is_locked')
            ->assertJsonCount(3, 'data.pages');
    }

    public function test_episode_list_includes_unlock_status(): void
    {
        $comic = $this->createComic();
        $this->createEpisode($comic, 1, false, 0);
        $premium = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 500);
        $token = $this->token($this->reader);

        $this->withToken($token)
            ->getJson("/api/v1/comics/{$comic->id}/episodes")
            ->assertStatus(200)
            ->assertJsonMissingPath('data.0.is_locked')   // episode gratis → tanpa is_locked
            ->assertJsonPath('data.0.is_unlocked', true)
            ->assertJsonPath('data.1.is_locked', true)
            ->assertJsonPath('data.1.is_unlocked', false);

        $this->withToken($token)->postJson("/api/v1/episodes/{$premium->id}/unlock")->assertStatus(201);

        $this->withToken($token)
            ->getJson("/api/v1/comics/{$comic->id}/episodes")
            ->assertStatus(200)
            ->assertJsonPath('data.1.is_unlocked', true)
            ->assertJsonMissingPath('data.1.is_locked');
    }

    // ============ Dompet & Riwayat ============

    public function test_wallet_show_returns_balance_and_stats(): void
    {
        $this->fund($this->reader, 500);

        $response = $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/wallet');

        $response->assertStatus(200)
            ->assertJsonPath('data.balance', 500)
            ->assertJsonPath('data.total_spent', 0)
            ->assertJsonPath('data.unlocks_count', 0);
    }

    public function test_transactions_history_includes_unlock_episode_info(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 500);
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/episodes/{$episode->id}/unlock")->assertStatus(201);

        $response = $this->withToken($token)
            ->getJson('/api/v1/me/transactions');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.type', 'episode_unlock')
            ->assertJsonPath('data.0.coins', 50)
            ->assertJsonPath('data.0.episode.title', 'Episode 2')
            ->assertJsonPath('data.0.episode.comic_title', 'Komik Monetisasi');
    }

    public function test_me_unlocks_lists_unlocked_episodes(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 500);
        $token = $this->token($this->reader);

        $this->withToken($token)->postJson("/api/v1/episodes/{$episode->id}/unlock")->assertStatus(201);

        $response = $this->withToken($token)->getJson('/api/v1/me/unlocks');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.coins_spent', 50)
            ->assertJsonPath('data.0.episode.comic_title', 'Komik Monetisasi');
    }

    // ============ Earning & Withdrawal Creator ============

    public function test_creator_earnings_summary(): void
    {
        $earning = $this->createPendingEarning(3000);

        $response = $this->withToken($this->token($this->creator))
            ->getJson('/api/v1/creator/earnings');

        $response->assertStatus(200)
            ->assertJsonPath('data.summary.pending', 3000)
            ->assertJsonPath('data.summary.paid', 0)
            ->assertJsonPath('data.summary.total', 3000)
            ->assertJsonPath('data.summary.available', 3000)
            ->assertJsonPath('data.earnings.0.id', $earning->id)
            ->assertJsonPath('data.earnings.0.amount', 3000)
            ->assertJsonPath('data.earnings.0.status', 'pending');
    }

    public function test_creator_can_request_withdrawal(): void
    {
        $this->createPendingEarning(10000);

        $response = $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/creator/withdrawals', [
                'amount' => 5000,
                'bank_name' => 'BCA',
                'bank_account' => '1234567890',
                'bank_holder' => 'Studio Kertas',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.amount', 5000);

        $this->assertDatabaseHas('withdrawals', [
            'creator_id' => $this->creator->id,
            'amount' => 5000,
            'status' => 'pending',
        ]);
        // Transaksi withdrawal dicatat pending
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->creator->id,
            'type' => 'withdrawal',
            'amount' => 5000,
            'status' => 'pending',
        ]);
    }

    public function test_creator_cannot_withdraw_more_than_available(): void
    {
        $this->createPendingEarning(10000);
        $token = $this->token($this->creator);

        $this->withToken($token)->postJson('/api/v1/creator/withdrawals', [
            'amount' => 10000,
            'bank_name' => 'BCA',
            'bank_account' => '123',
            'bank_holder' => 'Studio Kertas',
        ])->assertStatus(201);

        $this->withToken($token)->postJson('/api/v1/creator/withdrawals', [
            'amount' => 1000,
            'bank_name' => 'BCA',
            'bank_account' => '123',
            'bank_holder' => 'Studio Kertas',
        ])->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors('amount');
    }

    public function test_withdrawal_requires_bank_information(): void
    {
        $this->createPendingEarning(10000);

        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/creator/withdrawals', [
                'amount' => 5000,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bank_name', 'bank_account', 'bank_holder']);
    }

    // ============ Admin Transaksi & Withdrawal ============

    public function test_admin_can_list_transactions_with_filters(): void
    {
        $comic = $this->createComic();
        $episode = $this->createEpisode($comic, 2, true, 50);
        $this->fund($this->reader, 500);
        $this->withToken($this->token($this->reader))
            ->postJson("/api/v1/episodes/{$episode->id}/unlock")
            ->assertStatus(201);

        $response = $this->withToken($this->adminToken())
            ->getJson('/api/v1/admin/transactions?type=episode_unlock');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.type', 'episode_unlock')
            ->assertJsonPath('data.0.user.name', $this->reader->name)
            ->assertJsonPath('data.0.episode.title', 'Episode 2');
    }

    public function test_admin_can_approve_and_pay_withdrawal(): void
    {
        $this->createPendingEarning(10000);
        $token = $this->token($this->creator);

        $withdrawalId = $this->withToken($token)->postJson('/api/v1/creator/withdrawals', [
            'amount' => 6000,
            'bank_name' => 'BCA',
            'bank_account' => '1234567890',
            'bank_holder' => 'Studio Kertas',
        ])->json('data.id');

        $adminToken = $this->adminToken();

        $this->withToken($adminToken)
            ->patchJson("/api/v1/admin/withdrawals/{$withdrawalId}/status", [
                'status' => 'approved',
                'admin_note' => 'Diproses.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        // Earning masih pending sebelum dibayar
        $this->assertDatabaseHas('creator_earnings', [
            'creator_id' => $this->creator->id,
            'status' => 'pending',
            'amount' => 10000,
        ]);

        $this->withToken($adminToken)
            ->patchJson("/api/v1/admin/withdrawals/{$withdrawalId}/status", [
                'status' => 'paid',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'paid');

        // Earning ditandai paid (FIFO hingga nominal terpenuhi)
        $this->assertDatabaseHas('creator_earnings', [
            'creator_id' => $this->creator->id,
            'status' => 'paid',
            'amount' => 10000,
        ]);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->creator->id,
            'type' => 'withdrawal',
            'amount' => 6000,
            'status' => 'success',
        ]);
    }

    public function test_admin_can_reject_withdrawal(): void
    {
        $this->createPendingEarning(10000);
        $token = $this->token($this->creator);

        $withdrawalId = $this->withToken($token)->postJson('/api/v1/creator/withdrawals', [
            'amount' => 5000,
            'bank_name' => 'BCA',
            'bank_account' => '123',
            'bank_holder' => 'Studio',
        ])->json('data.id');

        $this->withToken($this->adminToken())
            ->patchJson("/api/v1/admin/withdrawals/{$withdrawalId}/status", [
                'status' => 'rejected',
                'admin_note' => 'Rekening tidak valid.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.admin_note', 'Rekening tidak valid.');

        // Earning kembali tersedia
        $this->assertDatabaseHas('creator_earnings', [
            'creator_id' => $this->creator->id,
            'status' => 'pending',
        ]);
        // Transaksi withdrawal ditandai failed
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->creator->id,
            'type' => 'withdrawal',
            'amount' => 5000,
            'status' => 'failed',
        ]);
    }

    public function test_admin_cannot_change_paid_withdrawal(): void
    {
        $this->createPendingEarning(10000);
        $token = $this->token($this->creator);

        $withdrawalId = $this->withToken($token)->postJson('/api/v1/creator/withdrawals', [
            'amount' => 5000,
            'bank_name' => 'BCA',
            'bank_account' => '123',
            'bank_holder' => 'Studio',
        ])->json('data.id');

        $adminToken = $this->adminToken();
        $this->withToken($adminToken)
            ->patchJson("/api/v1/admin/withdrawals/{$withdrawalId}/status", ['status' => 'paid'])
            ->assertStatus(200);

        $this->withToken($adminToken)
            ->patchJson("/api/v1/admin/withdrawals/{$withdrawalId}/status", ['status' => 'rejected'])
            ->assertStatus(422);
    }

    public function test_constant_coin_value_and_share(): void
    {
        $this->assertSame(100, MonetizationService::COIN_VALUE);
        $this->assertSame(0.60, MonetizationService::CREATOR_SHARE);
    }
}
