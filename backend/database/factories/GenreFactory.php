<?php

namespace Database\Factories;

use App\Models\Genre;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Genre>
 */
class GenreFactory extends Factory
{
    protected $model = Genre::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Action', 'Romance', 'Fantasy', 'Drama', 'Komedi', 'Horor',
            'Sci-Fi', 'Slice of Life', 'Thriller', 'Petualangan',
        ]);

        return [
            'slug' => Str::slug($name),
            'name' => $name,
        ];
    }
}
