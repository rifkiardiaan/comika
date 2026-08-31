<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpisodePageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'episode_id' => $this->episode_id,
            'page_number' => $this->page_number,
            'image_url' => asset('storage/'.$this->image_url),
        ];
    }
}
