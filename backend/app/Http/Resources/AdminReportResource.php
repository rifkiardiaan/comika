<?php

namespace App\Http\Resources;

use App\Models\Comic;
use App\Models\Comment;
use App\Models\Episode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminReportResource extends JsonResource
{
    /**
     * Ringkasan konten yang dilaporkan (polimorfik).
     *
     * @return array<string, mixed>|null
     */
    private function reportableSummary(): ?array
    {
        $target = $this->reportable;

        if ($target instanceof Comic) {
            return ['type' => 'comic', 'id' => $target->id, 'title' => $target->title];
        }

        if ($target instanceof Episode) {
            return ['type' => 'episode', 'id' => $target->id, 'title' => $target->title];
        }

        if ($target instanceof Comment) {
            return ['type' => 'comment', 'id' => $target->id, 'title' => $target->content];
        }

        if ($target instanceof User) {
            return ['type' => 'user', 'id' => $target->id, 'title' => $target->name];
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'description' => $this->description,
            'status' => $this->status,
            'admin_note' => $this->admin_note,
            'reporter' => [
                'id' => $this->reporter_id,
                'name' => $this->whenLoaded('reporter', fn () => $this->reporter?->name, null),
                'username' => $this->whenLoaded('reporter', fn () => $this->reporter?->username, null),
                'avatar_url' => $this->whenLoaded('reporter', fn () => $this->reporter?->avatar_url, null),
            ],
            'reportable_type' => $this->reportable_type,
            'reportable_id' => $this->reportable_id,
            'reportable' => $this->whenLoaded('reportable', fn () => $this->reportableSummary(), null),
            'handled_by' => $this->whenLoaded('handler', fn () => $this->handler ? [
                'id' => $this->handler->id,
                'name' => $this->handler->name,
            ] : null, null),
            'handled_at' => $this->handled_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
