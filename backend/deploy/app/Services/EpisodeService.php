<?php

namespace App\Services;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\EpisodePage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class EpisodeService
{
    /**
     * Buat episode baru — nomor episode otomatis jika tidak diberikan.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(Comic $comic, array $data): Episode
    {
        $number = $data['number'] ?? ($comic->episodes()->withTrashed()->max('number') + 1);

        $episode = $comic->episodes()->create([
            'title' => $data['title'],
            'number' => $number,
            'status' => Episode::STATUS_DRAFT,
            'is_premium' => $data['is_premium'] ?? false,
            'price_coin' => $data['price_coin'] ?? 0,
        ]);

        // Episode pertama otomatis gratis (pengalaman pembaca)
        if ($number === 1) {
            $episode->update(['is_premium' => false, 'price_coin' => 0]);
        }

        return $episode;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Episode $episode, array $data): Episode
    {
        $episode->update([
            'title' => $data['title'],
            'is_premium' => $data['is_premium'] ?? $episode->is_premium,
            'price_coin' => $data['price_coin'] ?? $episode->price_coin,
        ]);

        // Episode pertama tetap gratis
        if ($episode->number === 1) {
            $episode->update(['is_premium' => false, 'price_coin' => 0]);
        }

        return $episode->fresh();
    }

    /**
     * Unggah banyak halaman sekaligus.
     *
     * @param  UploadedFile[]  $files
     * @return Collection<int, EpisodePage>
     */
    public function uploadPages(Episode $episode, array $files): Collection
    {
        $startNumber = $episode->pages()->max('page_number') + 1;

        $pages = collect();
        foreach ($files as $index => $file) {
            $page = $episode->pages()->create([
                'page_number' => $startNumber + $index,
                'image_url' => $file->store('comic-pages/'.$episode->id, 'public'),
            ]);
            $pages->push($page);
        }

        return $pages;
    }

    /**
     * Publish episode — wajib memiliki minimal 1 halaman.
     */
    public function publish(Episode $episode): Episode
    {
        if ($episode->pages()->count() === 0) {
            throw ValidationException::withMessages([
                'pages' => ['Episode harus memiliki minimal 1 halaman sebelum dipublikasikan.'],
            ]);
        }

        $episode->update([
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        // Komik dianggap published begitu punya episode yang rilis
        $episode->comic()->update([
            'status' => Comic::STATUS_ONGOING,
            'published_at' => now(),
        ]);

        return $episode->fresh();
    }
}
