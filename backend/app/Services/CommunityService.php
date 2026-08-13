<?php

namespace App\Services;

use App\Models\Bookmark;
use App\Models\Comic;
use App\Models\Episode;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CommunityService
{
    /**
     * Toggle bookmark komik. Mengembalikan status baru.
     *
     * @return array{bookmarked: bool}
     */
    public function toggleBookmark(User $user, Comic $comic): array
    {
        return DB::transaction(function () use ($user, $comic) {
            $bookmark = Bookmark::where('user_id', $user->id)
                ->where('comic_id', $comic->id)
                ->first();

            if ($bookmark) {
                $bookmark->delete();

                return ['bookmarked' => false];
            }

            Bookmark::create([
                'user_id' => $user->id,
                'comic_id' => $comic->id,
            ]);

            return ['bookmarked' => true];
        });
    }

    /**
     * Toggle follow komik. Mengembalikan status baru.
     *
     * @return array{followed: bool}
     */
    public function toggleFollow(User $user, Comic $comic): array
    {
        return DB::transaction(function () use ($user, $comic) {
            $follow = Follow::where('user_id', $user->id)
                ->where('comic_id', $comic->id)
                ->first();

            if ($follow) {
                $follow->delete();

                return ['followed' => false];
            }

            Follow::create([
                'user_id' => $user->id,
                'comic_id' => $comic->id,
            ]);

            return ['followed' => true];
        });
    }

    /**
     * Toggle like pada likeable (Comic / Episode / Comment).
     * Menjaga kolom `like_count` tetap sinkron.
     *
     * @return array{liked: bool, like_count: int}
     */
    public function toggleLike(User $user, Model $likeable): array
    {
        return DB::transaction(function () use ($user, $likeable) {
            $like = Like::where('user_id', $user->id)
                ->where('likeable_type', $likeable->getMorphClass())
                ->where('likeable_id', $likeable->getKey())
                ->first();

            if ($like) {
                $like->delete();

                // Cegah counter negatif jika data tidak sinkron
                if ($likeable->like_count > 0) {
                    $likeable->decrement('like_count');
                }

                return ['liked' => false, 'like_count' => max(0, $likeable->fresh()->like_count)];
            }

            Like::create([
                'user_id' => $user->id,
                'likeable_type' => $likeable->getMorphClass(),
                'likeable_id' => $likeable->getKey(),
            ]);
            $likeable->increment('like_count');

            return ['liked' => true, 'like_count' => $likeable->fresh()->like_count];
        });
    }

    /**
     * Upsert rating user (1–5) untuk sebuah komik, lalu hitung ulang
     * rating_avg & rating_count pada komik.
     */
    public function rate(User $user, Comic $comic, int $score): Rating
    {
        return DB::transaction(function () use ($user, $comic, $score) {
            $rating = Rating::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'comic_id' => $comic->id,
                ],
                ['score' => $score]
            );

            $comic->update([
                'rating_avg' => round($comic->ratings()->avg('score'), 2),
                'rating_count' => $comic->ratings()->count(),
            ]);

            return $rating->fresh();
        });
    }
}
