<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreatorEarningResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'episode' => [
                'id' => $this->episode_id,
                'number' => $this->episode?->number,
                'title' => $this->episode?->title,
                'comic_id' => $this->episode?->comic_id,
                'comic_title' => $this->episode?->comic?->title,
            ],
            'reference' => $this->transaction?->reference,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
