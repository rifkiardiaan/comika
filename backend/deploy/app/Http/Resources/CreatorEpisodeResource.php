<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class CreatorEpisodeResource extends EpisodeResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $data['comments_count'] = $this->whenCounted('comments');

        return $data;
    }
}
