<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class CreatorComicResource extends ComicResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $data['published_episodes_count'] = $this->whenCounted('published_episodes_count');
        $data['draft_episodes_count'] = $this->whenCounted('draft_episodes_count');
        $data['followers_count'] = $this->whenCounted('follows');
        $data['comments_count'] = $this->whenCounted('comments');
        $data['bookmarks_count'] = $this->whenCounted('bookmarks');

        if ($this->relationLoaded('episodes')) {
            $data['episodes'] = CreatorEpisodeResource::collection($this->episodes);
        }

        return $data;
    }
}
