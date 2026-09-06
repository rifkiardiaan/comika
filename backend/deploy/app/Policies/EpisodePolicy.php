<?php

namespace App\Policies;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\User;

class EpisodePolicy
{
    /**
     * Hanya creator yang dapat membuat episode, dan hanya untuk komik miliknya.
     */
    public function create(User $user, Comic $comic): bool
    {
        return $user->isCreator() && $comic->creator_id === $user->id;
    }

    /**
     * Creator hanya dapat mengubah episode miliknya.
     */
    public function update(User $user, Episode $episode): bool
    {
        return $episode->comic_id !== null
            && $user->comics()->whereKey($episode->comic_id)->exists();
    }

    /**
     * Creator hanya dapat menghapus episode miliknya.
     */
    public function delete(User $user, Episode $episode): bool
    {
        return $this->update($user, $episode);
    }

    /**
     * Creator pemilik komik atau admin bisa publish episode.
     */
    public function publish(User $user, Episode $episode): bool
    {
        return $user->isAdmin() || $this->update($user, $episode);
    }

    /**
     * Creator hanya dapat mengunggah halaman ke episode miliknya.
     */
    public function uploadPages(User $user, Episode $episode): bool
    {
        return $this->update($user, $episode);
    }
}
