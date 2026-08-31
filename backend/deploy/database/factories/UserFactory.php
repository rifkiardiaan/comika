<?php

namespace Database\Factories;

use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => 'password',
            'role' => User::ROLE_READER,
            'avatar_url' => null,
            'coin_balance' => 0,
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function reader(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_READER,
        ]);
    }

    public function creator(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_CREATOR,
        ])->afterCreating(function (User $user) {
            CreatorProfile::factory()->create(['user_id' => $user->id]);
        });
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_ADMIN,
        ]);
    }
}
