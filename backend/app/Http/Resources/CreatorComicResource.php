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
        $data['pending_episodes_count'] = $this->whenCounted('pending_episodes_count');
        $data['followers_count'] = $this->whenCounted('follows');
        $data['comments_count'] = $this->whenCounted('comments');
        $data['bookmarks_count'] = $this->whenCounted('bookmarks');
        $data['verification_status'] = $this->verification_status ?? 'pending';
        $data['rejection_reason'] = $this->rejection_reason ?? null;
        $data['published_at'] = $this->published_at?->toIso8601String();

        if ($this->relationLoaded('episodes')) {
            $data['episodes'] = CreatorEpisodeResource::collection($this->episodes);
        }

        return $data;
    }
}
