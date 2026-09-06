<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Schema;

class EpisodeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Thumbnail: ambil gambar halaman pertama jika ada
        $thumbnailUrl = null;
        if ($this->relationLoaded('pages')) {
            $firstPage = $this->pages->sortBy('page_number')->first();
            $thumbnailUrl = $firstPage?->image_url;
        }

        $data = [
            'id' => $this->id,
            'comic_id' => $this->comic_id,
            'title' => $this->title,
            'number' => $this->number,
            'status' => $this->status,
            'is_premium' => $this->is_premium,
            'price_coin' => $this->price_coin,
            'view_count' => $this->view_count,
            'like_count' => $this->like_count,
            'page_count' => $this->whenCounted('pages'),
            'thumbnail_url' => $thumbnailUrl,
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            // rejection_reason opsional — beberapa DB produksi belum punya kolomnya.
            // Akses dilewati bila kolom tidak ada agar tidak memicu SQL error 42S22.
            'rejection_reason' => static::episodeHasRejectionReason() ? ($this->rejection_reason ?? null) : null,
        ];

        // Status unlock premium (diset oleh controller saat user login)
        $attributes = $this->resource->getAttributes();
        if (array_key_exists('is_unlocked', $attributes)) {
            $data['is_unlocked'] = (bool) $this->is_unlocked;
        }
        if (array_key_exists('is_locked', $attributes)) {
            $data['is_locked'] = (bool) $this->is_locked;
        }

        return $data;
    }

    /**
     * Cek sekali per request apakah kolom episodes.rejection_reason tersedia
     * (hindari error 42S22 di DB produksi yang belum di-migrasi).
     */
    private static function episodeHasRejectionReason(): bool
    {
        static $has = null;

        return $has ??= Schema::hasColumn('episodes', 'rejection_reason');
    }
}
