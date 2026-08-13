<?php

namespace App\Policies;

use App\Models\Comic;
use App\Models\User;

class ComicPolicy
{
    /**
     * Hanya creator yang dapat membuat komik.
     */
    public function create(User $user): bool
    {
        return $user->isCreator();
    }

    /**
     * Creator hanya dapat mengubah komik miliknya sendiri.
     */
    public function update(User $user, Comic $comic): bool
    {
        return $comic->creator_id === $user->id;
    }

    /**
     * Creator hanya dapat menghapus komik miliknya sendiri.
     */
    public function delete(User $user, Comic $comic): bool
    {
        return $comic->creator_id === $user->id;
    }
}
