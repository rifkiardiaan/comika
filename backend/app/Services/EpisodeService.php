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
        // Nomor episode otomatis TIDAK memperhitungkan episode yang sudah
        // dihapus — episode yang dihapus dianggap hilang, sehingga nomornya
        // bisa dipakai lagi (mis. episode 1 bisa dibuat ulang).
        $number = $data['number'] ?? ($comic->episodes()->max('number') + 1);

        // Kalau nomor ini masih "ditempati" oleh episode yang sudah dihapus
        // (soft delete), hapus permanen episode lama itu agar nomornya bebas
        // dan episode baru bisa dibuat. Episode yang sudah dihapus tidak
        // boleh menghalangi upload episode baru.
        $trashed = Episode::onlyTrashed()
            ->where('comic_id', $comic->id)
            ->where('number', $number)
            ->get();

        if ($trashed->isNotEmpty()) {
            foreach ($trashed as $oldEpisode) {
                $oldEpisode->forceDelete();
            }
        }

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
     * Setujui & terbitkan episode oleh admin — wajib memiliki minimal 1 halaman.
     * Komik tidak otomatis terbit di sini; persetujuan komik ditangani
     * oleh controller admin agar status verifikasi tetap konsisten.
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

        return $episode->fresh();
    }
}
