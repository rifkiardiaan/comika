<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use App\Services\EmailVerificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function unverifiedUser(): User
    {
        return User::factory()->reader()->create([
            'email_verified_at' => null,
        ]);
    }

    // ============ Registrasi & email ============

    public function test_register_sends_verification_email(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/register', [
            'name' => 'User Baru',
            'username' => 'userbaru',
            'email' => 'userbaru@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(201)
            ->assertJsonPath('data.user.is_email_verified', false);

        Mail::assertSent(VerifyEmailMail::class, function (VerifyEmailMail $mail) {
            return $mail->hasTo('userbaru@example.com')
                && $mail->verificationCode !== null
                && strlen($mail->verificationCode) === 6
                && $mail->verificationUrl !== '';
        });
    }

    public function test_user_resource_exposes_verification_status(): void
    {
        $user = User::factory()->reader()->create();

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('data.is_email_verified', true)
            ->assertJsonPath('data.email_verified_at', $user->email_verified_at->toIso8601String());
    }

    public function test_unauthenticated_cannot_resend_verification(): void
    {
        $this->postJson('/api/v1/auth/email/verification-notification')
            ->assertStatus(401);
    }

    public function test_authenticated_user_can_resend_verification(): void
    {
        Mail::fake();

        $user = $this->unverifiedUser();

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->postJson('/api/v1/auth/email/verification-notification')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        Mail::assertSent(VerifyEmailMail::class);
    }

    public function test_verified_user_resend_returns_message_without_email(): void
    {
        Mail::fake();

        $user = User::factory()->reader()->create();

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->postJson('/api/v1/auth/email/verification-notification')
            ->assertStatus(200)
            ->assertJsonPath('message', 'Email sudah terverifikasi.');

        Mail::assertNothingSent();
    }

    // ============ Verifikasi via link signed ============

    public function test_signed_link_verifies_email_and_redirects(): void
    {
        $user = $this->unverifiedUser();
        $url = VerifyEmailMail::urlFor($user);

        $this->assertStringContainsString('/email/verify/'.$user->id, $url);

        $this->get($url)
            ->assertRedirect(config('app.frontend_url').'/verify-email?verified=1');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_signed_link_rejects_wrong_hash(): void
    {
        $user = $this->unverifiedUser();

        $this->get("/email/verify/{$user->id}/salahhash?expires=".now()->addMinutes(60)->timestamp)
            ->assertStatus(403);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_expired_link_is_rejected(): void
    {
        $user = $this->unverifiedUser();

        // Buat URL dengan waktu kedaluwarsa di masa lalu
        $url = VerifyEmailMail::urlFor($user);
        $parsed = parse_url($url);
        parse_str($parsed['query'] ?? '', $query);
        $expiredUrl = "/email/verify/{$user->id}/".sha1($user->email)
            .'?expires='.(now()->subMinute()->timestamp)
            .'&signature='.$query['signature'];

        $this->get($expiredUrl)->assertStatus(403);
    }

    // ============ Verifikasi via kode 6 digit ============

    public function test_unauthenticated_cannot_verify_with_code(): void
    {
        $this->postJson('/api/v1/auth/email/verify-code', ['code' => '123456'])
            ->assertStatus(401);
    }

    public function test_service_generates_hashed_code_and_expiry(): void
    {
        $user = $this->unverifiedUser();
        $service = app(EmailVerificationService::class);

        $code = $service->send($user);
        $fresh = $user->fresh();

        $this->assertMatchesRegularExpression('/^[0-9]{6}$/', $code);
        $this->assertTrue(Hash::check($code, $fresh->email_verification_code));
        $this->assertNotNull($fresh->email_verification_code_expires_at);
        $this->assertTrue($fresh->email_verification_code_expires_at->isFuture());
    }

    public function test_verify_with_correct_code_marks_email_verified(): void
    {
        Mail::fake();

        $user = $this->unverifiedUser();
        $service = app(EmailVerificationService::class);

        $code = $service->send($user);

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->postJson('/api/v1/auth/email/verify-code', ['code' => $code])
            ->assertStatus(200)
            ->assertJsonPath('data.verified', true);

        $this->assertNotNull($user->fresh()->email_verified_at);

        // Kode langsung dibersihkan setelah berhasil
        $this->assertNull($user->fresh()->email_verification_code);
        $this->assertNull($user->fresh()->email_verification_code_expires_at);
    }

    public function test_verify_with_wrong_code_is_rejected(): void
    {
        Mail::fake();

        $user = $this->unverifiedUser();
        app(EmailVerificationService::class)->send($user);

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->postJson('/api/v1/auth/email/verify-code', ['code' => '000000'])
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_verify_with_invalid_format_is_rejected(): void
    {
        $user = $this->unverifiedUser();

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->postJson('/api/v1/auth/email/verify-code', ['code' => 'abc'])
            ->assertStatus(422);
    }

    public function test_expired_code_is_rejected(): void
    {
        Mail::fake();

        $user = $this->unverifiedUser();
        $service = app(EmailVerificationService::class);

        $code = $service->send($user);
        $user->forceFill([
            'email_verification_code_expires_at' => now()->subMinute(),
        ])->save();

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->postJson('/api/v1/auth/email/verify-code', ['code' => $code])
            ->assertStatus(422);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_verified_user_verify_code_returns_ok_without_code(): void
    {
        Mail::fake();

        $user = User::factory()->reader()->create();

        $this->withToken($user->createToken('auth')->plainTextToken)
            ->postJson('/api/v1/auth/email/verify-code', ['code' => '123456'])
            ->assertStatus(200)
            ->assertJsonPath('data.verified', true);

        Mail::assertNothingSent();
    }
}
