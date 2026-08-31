<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookmarkResource extends JsonResource
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
            'created_at' => $this->created_at?->toIso8601String(),
            'comic' => $this->whenLoaded('comic', fn () => new ComicResource($this->comic)),
        ];
    }
}
