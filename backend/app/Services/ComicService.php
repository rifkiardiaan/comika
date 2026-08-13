<?php

namespace App\Services;

use App\Models\Comic;
use Illuminate\Http\UploadedFile;

class ComicService
{
    /**
     * Buat komik baru beserta cover dan genre.
     *
     * @param  array<string, mixed>  $data
     * @param  int[]  $genreIds
     */
    public function create(int $creatorId, array $data, array $genreIds, ?UploadedFile $cover): Comic
    {
        $comic = Comic::create([
            'creator_id' => $creatorId,
            'title' => $data['title'],
            'slug' => SlugService::unique($data['title'], 'comics'),
            'synopsis' => $data['synopsis'],
            'cover_url' => $cover ? $this->storeCover($cover) : null,
            'status' => $data['status'] ?? Comic::STATUS_ONGOING,
            'age_rating' => $data['age_rating'] ?? 'semua_umur',
            'published_at' => now(),
        ]);

        $comic->genres()->sync($genreIds);

        return $comic;
    }

    /**
     * Update komik — slug diperbarui hanya jika judul berubah.
     *
     * @param  array<string, mixed>  $data
     * @param  int[]  $genreIds
     */
    public function update(Comic $comic, array $data, array $genreIds, ?UploadedFile $cover): Comic
    {
        $updateData = [
            'title' => $data['title'] ?? $comic->title,
            'synopsis' => $data['synopsis'] ?? $comic->synopsis,
            'status' => $data['status'] ?? $comic->status,
            'age_rating' => $data['age_rating'] ?? $comic->age_rating,
        ];

        // Slug berubah hanya jika judul berubah
        if (isset($data['title']) && $data['title'] !== $comic->title) {
            $updateData['slug'] = SlugService::unique($data['title'], 'comics', 'slug', $comic->id);
        }

        if ($cover) {
            $updateData['cover_url'] = $this->storeCover($cover);
        }

        $comic->update($updateData);
        $comic->genres()->sync($genreIds);

        return $comic->fresh();
    }

    private function storeCover(UploadedFile $cover): string
    {
        return $cover->store('comic-covers', 'public');
    }
}
