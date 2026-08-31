<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminComicResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'synopsis' => $this->synopsis,
            'cover_url' => $this->cover_url
                ? asset('storage/'.$this->cover_url)
                : null,
            'status' => $this->status,
            'age_rating' => $this->age_rating,
            'verification_status' => $this->verification_status ?? 'pending',
            'rejection_reason' => $this->rejection_reason,
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => $this->rating_count,
            'like_count' => $this->like_count,
            'view_count' => $this->view_count,
            'episode_count' => $this->whenCounted('episodes'),
            'creator' => [
                'id' => $this->creator_id,
                'name' => $this->whenLoaded('creator', fn () => $this->creator->name, null),
                'avatar_url' => $this->whenLoaded('creator', fn () => $this->creator->avatar_url, null),
            ],
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
