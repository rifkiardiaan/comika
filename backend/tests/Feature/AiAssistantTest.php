<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiAssistantTest extends TestCase
{
    use RefreshDatabase;

    private User $creator;
    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->creator = User::factory()->creator()->create();
        $this->reader = User::factory()->reader()->create();
    }

    private function token(User $user): string
    {
        return $user->createToken('auth')->plainTextToken;
    }

    // ============ Autentikasi & otorisasi ============

    public function test_unauthenticated_cannot_use_ai_tools(): void
    {
        $this->postJson('/api/v1/ai/titles', ['topic' => 'Prajurit'])->assertStatus(401);
        $this->postJson('/api/v1/ai/synopsis')->assertStatus(401);
        $this->postJson('/api/v1/ai/genres-tags')->assertStatus(401);
        $this->postJson('/api/v1/ai/character')->assertStatus(401);
        $this->postJson('/api/v1/ai/outline')->assertStatus(401);
    }

    public function test_reader_cannot_use_ai_tools(): void
    {
        $this->withToken($this->token($this->reader))
            ->postJson('/api/v1/ai/titles', ['topic' => 'Prajurit'])
            ->assertStatus(403)
            ->assertJsonPath('message', 'Hanya creator yang dapat mengakses fitur ini.');
    }

    public function test_status_endpoint_is_public(): void
    {
        $this->getJson('/api/v1/ai/status')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.configured', false);
    }

    public function test_status_reflects_configuration(): void
    {
        config(['services.ai.api_key' => 'test-key']);

        $this->getJson('/api/v1/ai/status')
            ->assertStatus(200)
            ->assertJsonPath('data.configured', true);
    }

    // ============ Fallback rule-based (tanpa API key) ============

    public function test_titles_fallback_returns_unique_titles(): void
    {
        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/titles', ['topic' => 'Prajurit', 'genres' => ['Action']])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['titles' => ['*' => []]]])
            ->assertJsonCount(5, 'data.titles');
    }

    public function test_titles_respects_count(): void
    {
        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/titles', ['topic' => 'Naga', 'count' => 3])
            ->assertStatus(200)
            ->assertJsonCount(3, 'data.titles');
    }

    public function test_synopsis_fallback_returns_text(): void
    {
        $response = $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/synopsis', ['title' => 'Pedang Senja', 'genres' => ['Fantasy']])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['synopsis']]);

        $this->assertNotEmpty($response->json('data.synopsis'));
    }

    public function test_genres_tags_fallback_returns_lists(): void
    {
        $response = $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/genres-tags', [
                'title' => 'Naga dan Pedang',
                'synopsis' => 'Pertarungan melawan naga di dunia fantasi.',
            ])
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['genres' => ['*' => []], 'tags' => ['*' => []]]]);

        $genres = $response->json('data.genres');
        $this->assertContains('Fantasy', $genres);
        $this->assertContains('Action', $genres);
    }

    public function test_character_fallback_returns_structure(): void
    {
        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/character', ['role' => 'antagonis', 'genres' => ['Thriller']])
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['character' => ['name', 'role', 'personality', 'traits' => ['*' => []], 'backstory']],
            ])
            ->assertJsonPath('data.character.role', 'Antagonis');
    }

    public function test_outline_fallback_returns_beats(): void
    {
        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/outline', [
                'title' => 'Ekspedisi Pulau Hilang',
                'genres' => ['Petualangan'],
                'count' => 4,
            ])
            ->assertStatus(200)
            ->assertJsonCount(4, 'data.outline')
            ->assertJsonStructure(['data' => ['outline' => [['number', 'title', 'summary']]]])
            ->assertJsonPath('data.outline.0.number', 1);
    }

    public function test_count_out_of_range_is_rejected(): void
    {
        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/titles', ['topic' => 'Naga', 'count' => 99])
            ->assertStatus(422);
    }

    public function test_genres_must_be_array_of_strings(): void
    {
        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/titles', ['genres' => 'Action'])
            ->assertStatus(422);
    }

    // ============ Mode LLM (OpenAI-compatible) ============

    public function test_titles_uses_llm_when_configured(): void
    {
        config([
            'services.ai.api_key' => 'test-key',
            'services.ai.base_url' => 'https://llm.example.test/v1',
            'services.ai.model' => 'gpt-test',
        ]);

        Http::fake([
            'llm.example.test/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => '{"titles": ["Pedang Naga", "Badai Senja", "Legenda Langit"]}'],
                ]],
            ], 200),
        ]);

        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/titles', ['topic' => 'Naga'])
            ->assertStatus(200)
            ->assertJsonPath('data.titles.0', 'Pedang Naga')
            ->assertJsonCount(3, 'data.titles');

        Http::assertSent(function ($request) {
            $body = $request->data();

            return $request->url() === 'https://llm.example.test/v1/chat/completions'
                && $body['model'] === 'gpt-test'
                && $body['messages'][0]['role'] === 'system';
        });
    }

    public function test_llm_failure_falls_back_to_rule_based(): void
    {
        config(['services.ai.api_key' => 'test-key']);

        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::response(['error' => 'bad key'], 401),
        ]);

        $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/titles', ['topic' => 'Naga'])
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['titles' => ['*' => []]]])
            ->assertJsonCount(5, 'data.titles');
    }

    public function test_llm_invalid_json_falls_back_to_rule_based(): void
    {
        config(['services.ai.api_key' => 'test-key']);

        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => 'maaf, saya tidak bisa menjawab'],
                ]],
            ], 200),
        ]);

        $response = $this->withToken($this->token($this->creator))
            ->postJson('/api/v1/ai/synopsis', ['title' => 'Pedang Senja'])
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['synopsis']]);

        $this->assertNotEmpty($response->json('data.synopsis'));
    }

    public function test_service_detects_genre_from_keywords(): void
    {
        $service = app(AiService::class);

        $result = $service->suggestGenresTags([
            'synopsis' => 'Pertarungan melawan naga di kerajaan yang dikuasai sihir.',
        ]);

        $this->assertContains('Fantasy', $result['genres']);
        $this->assertNotEmpty($result['tags']);
    }
}
