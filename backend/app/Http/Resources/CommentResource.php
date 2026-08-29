<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
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
            'parent_id' => $this->parent_id,
            'content' => $this->content,
            'like_count' => $this->like_count,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->whenLoaded('user', fn () => $this->user->name, null),
                'username' => $this->whenLoaded('user', fn () => $this->user->username, null),
                'avatar_url' => $this->whenLoaded('user', fn () => $this->user->avatar_url, null),
                'is_vvip' => $this->whenLoaded('user', fn () => $this->user->is_vvip, false),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
            'parent_user' => $this->whenLoaded('parent', fn () => [
                'id' => $this->parent->user_id,
                'name' => $this->parent->user?->name,
            ]),
        ];
    }
}
