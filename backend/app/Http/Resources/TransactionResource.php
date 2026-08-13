<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'reference' => $this->reference,
            'type' => $this->type,
            'status' => $this->status,
            'amount' => (float) $this->amount,
            'coins' => (int) $this->coins,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];

        // Info episode untuk transaksi unlock (dimuat via unlocks.episode.comic)
        if ($this->relationLoaded('unlocks') && $this->unlocks->isNotEmpty()) {
            $unlock = $this->unlocks->first();
            $episode = $unlock->episode;

            $data['episode'] = [
                'id' => $unlock->episode_id,
                'number' => $episode?->number,
                'title' => $episode?->title,
                'comic_title' => $episode?->comic?->title,
            ];
        }

        return $data;
    }
}
