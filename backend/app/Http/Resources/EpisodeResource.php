<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpisodeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
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
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
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
}
