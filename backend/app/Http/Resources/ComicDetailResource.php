<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ComicDetailResource extends ComicResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $data['episodes'] = EpisodeResource::collection($this->whenLoaded('episodes'));

        // Status aksi community user (diset oleh controller saat user login)
        if (array_key_exists('user_actions', $this->resource->getAttributes())) {
            $data['user_actions'] = $this->resource->user_actions;
        }

        // Progress baca terakhir user (diset oleh controller saat user login)
        if (array_key_exists('user_progress', $this->resource->getAttributes())) {
            $data['user_progress'] = $this->resource->user_progress ? [
                'episode_id' => $this->user_progress->episode_id,
                'episode_number' => $this->user_progress->episode?->number,
                'episode_title' => $this->user_progress->episode?->title,
                'last_page' => $this->user_progress->last_page,
                'progress' => (float) $this->user_progress->progress,
                'is_completed' => $this->user_progress->is_completed,
                'updated_at' => $this->resource->user_progress->updated_at?->toIso8601String(),
            ] : null;
        }

        return $data;
    }
}
