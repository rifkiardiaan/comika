<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'comic_id' => $this->comic_id,
            'score' => $this->score,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->whenLoaded('user', fn () => $this->user->name, null),
                'username' => $this->whenLoaded('user', fn () => $this->user->username, null),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
