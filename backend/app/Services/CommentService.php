<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Comic;
use App\Models\Episode;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CommentService
{
    /**
     * Buat komentar pada komik (atau episode tertentu, atau balasan).
     *
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, Comic $comic, array $data): Comment
    {
        $episodeId = $data['episode_id'] ?? null;
        $parentId = $data['parent_id'] ?? null;

        // Balasan harus mengarah ke komentar top-level di komik yang sama
        if ($parentId) {
            $parent = Comment::findOrFail($parentId);

            if ($parent->comic_id !== $comic->id || $parent->parent_id !== null) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Balasan hanya bisa dibuat pada komentar utama di komik ini.'],
                ]);
            }

            if ($parent->episode_id !== $episodeId) {
                throw ValidationException::withMessages([
                    'parent_id' => ['Balasan harus berada di tempat komentar yang sama.'],
                ]);
            }
        }

        return $comic->comments()->create([
            'user_id' => $user->id,
            'episode_id' => $episodeId,
            'parent_id' => $parentId,
            'content' => $data['content'],
            'status' => Comment::STATUS_ACTIVE,
        ]);
    }

    /**
     * Update komentar milik sendiri.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Comment $comment, array $data): Comment
    {
        $comment->update(['content' => $data['content']]);

        return $comment->fresh();
    }

    /**
     * Soft delete komentar milik sendiri.
     */
    public function destroy(Comment $comment): void
    {
        // Hapus juga balasan-balasannya agar tidak menggantung
        $comment->replies()->delete();
        $comment->delete();
    }

    /**
     * Komentar top-level (parent_id null) dengan balasannya, siap untuk list.
     */
    public function listFor(Comic $comic, ?Episode $episode = null, int $perPage = 10)
    {
        $query = $comic->comments()
            ->whereNull('parent_id')
            ->where('status', Comment::STATUS_ACTIVE)
            ->with(['user', 'replies' => fn ($q) => $q->where('status', Comment::STATUS_ACTIVE)->with('user')])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($episode) {
            $query->where('episode_id', $episode->id);
        } else {
            $query->whereNull('episode_id');
        }

        return $query->paginate($perPage);
    }
}
