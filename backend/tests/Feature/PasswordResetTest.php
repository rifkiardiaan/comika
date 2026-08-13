<?php

namespace Tests\Feature;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_link_email(): void
    {
        Mail::fake();

        $user = User::factory()->reader()->create();

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ])->assertStatus(200)
            ->assertJsonPath('success', true);

        Mail::assertSent(ResetPasswordMail::class, function (ResetPasswordMail $mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_forgot_password_does_not_leak_email_existence(): void
    {
        Mail::fake();

        // Email tak dikenal → respons identik dengan email terdaftar
        // (tanpa field status) agar tidak membocorkan keberadaan akun
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'tidakada@example.com',
        ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonMissingPath('data.status');

        $this->assertSame($response->json('message'), 'Jika email terdaftar, link reset password telah dikirim.');
        Mail::assertNothingSent();
    }

    public function test_forgot_password_with_capitalized_email_finds_user(): void
    {
        Mail::fake();

        $user = User::factory()->reader()->create(['email' => 'budi@example.com']);

        // Email kapital harus tetap menembak user yang tersimpan lowercase
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'Budi@Example.COM',
        ])->assertStatus(200)
            ->assertJsonPath('success', true);

        Mail::assertSent(ResetPasswordMail::class, function (ResetPasswordMail $mail) use ($user) {
            return $mail->hasTo('budi@example.com');
        });
    }

    public function test_reset_password_with_capitalized_email_matches_token(): void
    {
        // Token dibuat untuk email lowercase; reset memakai email kapital
        // harus tetap valid karena keduanya dinormalisasi ke lowercase.
        $user = User::factory()->reader()->create(['email' => 'budi@example.com']);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'Budi@Example.COM',
            'token' => $token,
            'password' => 'passwordbaru123',
            'password_confirmation' => 'passwordbaru123',
        ])->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('passwordbaru123', $user->fresh()->password));
    }

    public function test_forgot_password_validation(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'bukan-email',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_reset_password_with_valid_token(): void
    {
        $user = User::factory()->reader()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'passwordbaru123',
            'password_confirmation' => 'passwordbaru123',
        ])->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('passwordbaru123', $user->fresh()->password));
    }

    public function test_reset_password_revokes_old_tokens(): void
    {
        $user = User::factory()->reader()->create();
        $token = Password::createToken($user);
        $oldToken = $user->createToken('auth')->plainTextToken;

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'passwordbaru123',
            'password_confirmation' => 'passwordbaru123',
        ])->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertNotNull($oldToken); // token lama sudah tidak berlaku
    }

    public function test_reset_password_with_invalid_token(): void
    {
        $user = User::factory()->reader()->create();

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => 'token-palsu',
            'password' => 'passwordbaru123',
            'password_confirmation' => 'passwordbaru123',
        ])->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors('email');
    }

    public function test_reset_password_validation(): void
    {
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'user@example.com',
            'token' => 'token',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }
}
