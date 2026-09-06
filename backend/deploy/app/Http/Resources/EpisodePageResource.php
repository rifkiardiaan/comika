<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\BuildsStorageUrls;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpisodePageResource extends JsonResource
{
    use BuildsStorageUrls;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'episode_id' => $this->episode_id,
            'page_number' => $this->page_number,
            'image_url' => $this->storageUrl($request, $this->image_url),
        ];
    }
}
