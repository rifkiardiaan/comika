<?php

namespace Database\Factories;

use App\Models\CreatorProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CreatorProfile>
 */
class CreatorProfileFactory extends Factory
{
    protected $model = CreatorProfile::class;

    public function definition(): array
    {
        return [
            'display_name' => fake()->company(),
            'bio' => fake()->sentence(12),
            'banner_url' => null,
            'is_verified' => fake()->boolean(30),
        ];
    }
}
