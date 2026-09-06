<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\BuildsStorageUrls;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Profil creator untuk halaman publik (tanpa data sensitif user).
 */
class PublicCreatorResource extends JsonResource
{
    use BuildsStorageUrls;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->creatorProfile;

        return [
            'id' => $this->id,
            'username' => $this->username,
            'display_name' => $profile?->display_name ?? $this->name,
            'bio' => $profile?->bio,
            'avatar_url' => $this->avatar_url,
            'banner_url' => $this->storageUrl($request, $profile?->banner_url),
            'is_verified' => (bool) $profile?->is_verified,
            'stats' => $this->stats,
            'comics' => ComicResource::collection($this->public_comics),
        ];
    }
}
