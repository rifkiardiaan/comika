<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    /**
     * Hanya pemilik komentar (atau admin) yang boleh mengubah.
     */
    public function update(User $user, Comment $comment): bool
    {
        return $user->isAdmin() || $user->id === $comment->user_id;
    }

    /**
     * Hanya pemilik komentar (atau admin) yang boleh menghapus.
     */
    public function delete(User $user, Comment $comment): bool
    {
        return $user->isAdmin() || $user->id === $comment->user_id;
    }
}
