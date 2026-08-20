<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DeleteAvatarTest extends TestCase
{
    use RefreshDatabase;

    public function test_delete_avatar_requires_authentication(): void
    {
        $this->deleteJson('/api/v1/auth/me/avatar')->assertStatus(401);
    }

    public function test_delete_avatar_removes_avatar_url(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        // Upload avatar terlebih dahulu
        $fakeImage = UploadedFile::fake()->image('avatar.png', 100, 100);
        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/profile', [
                'name' => $user->name,
                'avatar' => $fakeImage,
            ])
            ->assertStatus(200);

        $this->assertNotNull($user->fresh()->avatar_url);

        // Hapus avatar
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson('/api/v1/auth/me/avatar');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.avatar_url', null)
            ->assertJsonStructure(['data' => ['id', 'name', 'avatar_url']]);

        $this->assertNull($user->fresh()->avatar_url);
    }

    public function test_delete_avatar_without_existing_avatar(): void
    {
        $user = User::factory()->create(['avatar_url' => null]);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson('/api/v1/auth/me/avatar');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.avatar_url', null);
    }

    public function test_delete_avatar_returns_updated_user(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['name' => 'Test User']);
        $token = $user->createToken('auth')->plainTextToken;

        // Upload avatar
        $fakeImage = UploadedFile::fake()->image('avatar.jpg', 100, 100);
        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/auth/me/profile', [
                'name' => 'Test User',
                'avatar' => $fakeImage,
            ])
            ->assertStatus(200);

        // Hapus avatar — pastikan data user lain tetap utuh
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson('/api/v1/auth/me/avatar');

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Test User')
            ->assertJsonPath('data.avatar_url', null);
    }
}
