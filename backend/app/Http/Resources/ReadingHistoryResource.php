<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReadingHistoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'comic_id' => $this->comic_id,
            'episode_id' => $this->episode_id,
            'last_page' => $this->last_page,
            'progress' => (float) $this->progress,
            'is_completed' => $this->is_completed,
            'updated_at' => $this->updated_at?->toIso8601String(),
            'comic' => $this->whenLoaded('comic', fn () => new ComicResource($this->comic)),
            'episode' => $this->whenLoaded('episode', fn () => new EpisodeResource($this->episode)),
        ];
    }
}
