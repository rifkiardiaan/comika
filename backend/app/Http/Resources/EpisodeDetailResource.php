<?php

namespace App\Http\Resources;

use App\Models\Episode;
use Illuminate\Http\Request;

class EpisodeDetailResource extends EpisodeResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        // Halaman episode premium yang belum di-unlock disetel ke koleksi kosong
        // oleh controller (setRelation 'pages'). Resource tetap menyertakan kunci
        // 'pages' biar frontend tidak menganggap data belum datang dan stuck di
        // "Memuat episode…". Episode yang sudah terbuka ikut diserialkan di sini.
        $data['pages'] = EpisodePageResource::collection($this->whenLoaded('pages'));

        // Navigasi prev/next (diset oleh controller)
        $attributes = $this->resource->getAttributes();
        if (array_key_exists('prev_episode', $attributes) || array_key_exists('next_episode', $attributes)) {
            $data['prev'] = $this->resource->prev_episode ? $this->navEpisode($this->resource->prev_episode) : null;
            $data['next'] = $this->resource->next_episode ? $this->navEpisode($this->resource->next_episode) : null;
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function navEpisode(Episode $episode): array
    {
        return [
            'id' => $episode->id,
            'number' => $episode->number,
            'title' => $episode->title,
        ];
    }
}
