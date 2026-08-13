<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCommentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'status' => $this->status,
            'like_count' => $this->like_count,
            'parent_id' => $this->parent_id,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->whenLoaded('user', fn () => $this->user?->name, null),
                'avatar_url' => $this->whenLoaded('user', fn () => $this->user?->avatar_url, null),
            ],
            'comic' => $this->whenLoaded('comic', fn () => [
                'id' => $this->comic_id,
                'title' => $this->comic?->title,
            ], null),
            'episode' => $this->whenLoaded('episode', fn () => [
                'id' => $this->episode_id,
                'number' => $this->episode?->number,
                'title' => $this->episode?->title,
            ], null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
