<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Pembaca',
            'username' => 'budi',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'budi@example.com')
            ->assertJsonPath('data.user.role', 'reader')
            ->assertJsonStructure(['data' => ['user', 'token', 'token_type']]);

        $this->assertDatabaseHas('users', ['email' => 'budi@example.com', 'role' => 'reader']);
        // Wallet otomatis dibuat saat registrasi
        $this->assertDatabaseHas('wallets', ['coin_balance' => 0]);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Lain',
            'username' => 'budi2',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors('email');
    }

    public function test_register_rejects_short_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi',
            'username' => 'budi3',
            'email' => 'budi3@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }



    public function test_register_returns_default_coin_balance(): void
    {
        // Default DB (0) harus terbawa di respons — bukan null — agar
        // UI (mis. toLocaleString di Navbar/Profile) tidak crash.
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Koin',
            'username' => 'budikoin',
            'email' => 'budikoin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.coin_balance', 0);

        $this->assertDatabaseHas('users', ['email' => 'budikoin@example.com', 'coin_balance' => 0]);
    }

    public function test_register_normalizes_email_and_username_to_lowercase(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Kapital',
            'username' => 'BudiKapital',
            'email' => 'Budi@Example.COM',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'budi@example.com')
            ->assertJsonPath('data.user.username', 'budikapital');

        // Tersimpan lowercase di DB agar lookup login konsisten
        $this->assertDatabaseHas('users', [
            'email' => 'budi@example.com',
            'username' => 'budikapital',
        ]);
    }

    public function test_register_with_capital_email_does_not_collide_with_lowercase(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        // Email kapital yang sama harus ditolak sebagai duplikat
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Lain',
            'username' => 'budi2',
            'email' => 'BUDI@Example.COM',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_login_returns_token_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'budi@example.com')
            ->assertJsonStructure(['data' => ['user', 'token', 'token_type']]);

        $this->assertNotNull($user->tokens()->first());
    }

    public function test_login_accepts_unverified_email(): void
    {
        $user = User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'budi@example.com');
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors('email');
    }

    public function test_login_accepts_capitalized_email(): void
    {
        User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        // Login memakai email kapital harus tetap sukses (case-insensitive)
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'Budi@Example.COM',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'budi@example.com');
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonMissing(['data.password']);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertCount(0, $user->tokens()->get());

        // PHPUnit memakai satu container instance — reset guard cache agar
        // request berikutnya benar-benar memvalidasi ulang token dari DB.
        $this->app['auth']->forgetGuards();

        // Token lama tidak bisa dipakai lagi
        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    // ============ Update profil ============

    public function test_update_profile_requires_authentication(): void
    {
        $this->putJson('/api/v1/auth/me/profile', ['name' => 'Nama Baru'])->assertStatus(401);
    }

    public function test_update_profile_name_only(): void
    {
        $user = User::factory()->create(['name' => 'Nama Lama']);
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/profile', ['name' => 'Nama Baru'])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Nama Baru');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Nama Baru']);
    }

    public function test_update_profile_with_avatar_upload(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $fakeImage = \Illuminate\Http\UploadedFile::fake()->image('avatar.png', 100, 100);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/profile', [
                'name' => 'Nama Dengan Avatar',
                'avatar' => $fakeImage,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Nama Dengan Avatar')
            ->assertJsonStructure(['data' => ['id', 'name', 'avatar_url']]);

        $this->assertNotNull($user->fresh()->avatar_url);
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($user->fresh()->avatar_url);
    }

    public function test_update_profile_requires_name(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/profile', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_update_profile_rejects_non_image_avatar(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/profile', [
                'name' => 'Nama',
                'avatar' => \Illuminate\Http\UploadedFile::fake()->create('file.txt', 10),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('avatar');
    }

    // ============ Ganti password ============

    public function test_change_password_requires_authentication(): void
    {
        $this->putJson('/api/v1/auth/me/password', [
            'current_password' => 'password123',
            'password' => 'passwordbaru123',
            'password_confirmation' => 'passwordbaru123',
        ])->assertStatus(401);
    }

    public function test_change_password_with_valid_current(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/password', [
                'current_password' => 'password123',
                'password' => 'passwordbaru123',
                'password_confirmation' => 'passwordbaru123',
            ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Password berhasil diubah.');

        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('passwordbaru123', $user->fresh()->password));
    }

    public function test_change_password_rejects_wrong_current(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/password', [
                'current_password' => 'salah-password',
                'password' => 'passwordbaru123',
                'password_confirmation' => 'passwordbaru123',
            ])->assertStatus(422)
            ->assertJsonValidationErrors('current_password');

        // Password tidak berubah
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('password123', $user->fresh()->password));
    }

    public function test_change_password_rejects_short_new_password(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/password', [
                'current_password' => 'password123',
                'password' => 'short',
                'password_confirmation' => 'short',
            ])->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    public function test_change_password_rejects_mismatched_confirmation(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $token = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/password', [
                'current_password' => 'password123',
                'password' => 'passwordbaru123',
                'password_confirmation' => 'berbeda123',
            ])->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    public function test_change_password_revokes_other_tokens_but_keeps_current(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $current = $user->createToken('auth')->plainTextToken;
        $other = $user->createToken('auth')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $current")
            ->putJson('/api/v1/auth/me/password', [
                'current_password' => 'password123',
                'password' => 'passwordbaru123',
                'password_confirmation' => 'passwordbaru123',
            ])->assertStatus(200);

        // Hanya token yang sedang dipakai yang tersisa
        $this->assertSame(1, $user->tokens()->count());

        // Token lain sudah tidak valid
        $this->app['auth']->forgetGuards();
        $this->withHeader('Authorization', "Bearer $other")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);

        // Token saat ini tetap valid
        $this->app['auth']->forgetGuards();
        $this->withHeader('Authorization', "Bearer $current")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200);
    }
}
