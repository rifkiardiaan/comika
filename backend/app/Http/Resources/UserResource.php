<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
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
            'is_premium' => $this->isPremium(),
            'premium_until' => $this->premium_until?->toIso8601String(),
            'is_vvip' => $this->isVvip(),
            'vvip_until' => $this->vvip_until?->toIso8601String(),
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'is_email_verified' => (bool) $this->hasVerifiedEmail(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
