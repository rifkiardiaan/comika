<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityMiddlewareTest extends TestCase
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

    // ============ Security headers ============

    public function test_api_response_includes_security_headers(): void
    {
        $response = $this->getJson('/api/v1/health')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");

        // Symfony menormalkan urutan directive; pastikan semua directive ada
        $cacheControl = $response->headers->get('Cache-Control');
        $this->assertStringContainsString('no-store', $cacheControl);
        $this->assertStringContainsString('private', $cacheControl);
    }

    // ============ Clamp per_page (anti-DoS) ============

    public function test_per_page_is_clamped_to_max_100(): void
    {
        $this->getJson('/api/v1/comics?per_page=999999999')
            ->assertStatus(200)
            ->assertJsonPath('meta.per_page', 100);
    }

    public function test_per_page_lower_bound_is_1(): void
    {
        $this->getJson('/api/v1/comics?per_page=0')
            ->assertStatus(200)
            ->assertJsonPath('meta.per_page', 1);
    }

    public function test_per_page_within_range_is_kept(): void
    {
        $this->getJson('/api/v1/comics?per_page=20')
            ->assertStatus(200)
            ->assertJsonPath('meta.per_page', 20);
    }

    public function test_per_page_clamp_applies_to_authenticated_lists(): void
    {
        $this->withToken($this->token($this->reader))
            ->getJson('/api/v1/me/notifications?per_page=5000')
            ->assertStatus(200)
            ->assertJsonPath('meta.per_page', 100);
    }
}
