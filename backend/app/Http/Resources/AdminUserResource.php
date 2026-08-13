<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'role' => $this->role,
            'coin_balance' => $this->coin_balance,
            'comics_count' => $this->whenCounted('comics'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
