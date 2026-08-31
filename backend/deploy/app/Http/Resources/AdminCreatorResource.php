<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCreatorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->whenLoaded('creatorProfile');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'display_name' => $profile?->display_name,
            'bio' => $profile?->bio,
            'banner_url' => $profile?->banner_url
                ? asset('storage/'.$profile->banner_url)
                : null,
            'is_verified' => $profile?->is_verified ?? false,
            'comics_count' => $this->whenCounted('comics'),
            'published_comics_count' => $this->whenCounted('comics as published_comics_count'),
            'total_views' => (int) ($this->total_views ?? 0),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
