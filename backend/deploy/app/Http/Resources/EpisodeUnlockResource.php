<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\BuildsStorageUrls;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpisodeUnlockResource extends JsonResource
{
    use BuildsStorageUrls;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'episode_id' => $this->episode_id,
            'coins_spent' => $this->coins_spent,
            'unlocked_at' => $this->created_at?->toIso8601String(),
        ];

        if ($this->relationLoaded('episode')) {
            $data['episode'] = [
                'id' => $this->episode->id,
                'number' => $this->episode->number,
                'title' => $this->episode->title,
                'comic_id' => $this->episode->comic_id,
                'comic_title' => $this->episode->comic?->title,
                'cover_url' => $this->storageUrl($request, $this->episode->comic?->cover_url),
            ];
        }

        return $data;
    }
}
