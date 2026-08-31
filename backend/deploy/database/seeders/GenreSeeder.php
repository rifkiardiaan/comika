<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            ['slug' => 'action', 'name' => 'Action'],
            ['slug' => 'romance', 'name' => 'Romance'],
            ['slug' => 'fantasy', 'name' => 'Fantasy'],
            ['slug' => 'drama', 'name' => 'Drama'],
            ['slug' => 'comedy', 'name' => 'Komedi'],
            ['slug' => 'horror', 'name' => 'Horor'],
            ['slug' => 'sci-fi', 'name' => 'Sci-Fi'],
            ['slug' => 'slice-of-life', 'name' => 'Slice of Life'],
            ['slug' => 'thriller', 'name' => 'Thriller'],
            ['slug' => 'adventure', 'name' => 'Petualangan'],
        ];

        foreach ($genres as $genre) {
            Genre::updateOrCreate(['slug' => $genre['slug']], $genre);
        }
    }
}
