<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comic extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_ONGOING = 'ongoing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_HIATUS = 'hiatus';

    public const AGE_ALL = 'semua_umur';
    public const AGE_TEEN = 'remaja';
    public const AGE_ADULT = 'dewasa';

    public const VERIFICATION_PENDING = 'pending';
    public const VERIFICATION_APPROVED = 'approved';
    public const VERIFICATION_REJECTED = 'rejected';

    protected $fillable = [
        'creator_id',
        'title',
        'slug',
        'synopsis',
        'cover_url',
        'status',
        'age_rating',
        'rating_avg',
        'rating_count',
        'like_count',
        'view_count',
        'published_at',
        'verification_status',
        'rejection_reason',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'comic_genres');
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class);
    }

    public function publishedEpisodes(): HasMany
    {
        return $this->hasMany(Episode::class)->where('status', Episode::STATUS_PUBLISHED);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function follows(): HasMany
    {
        return $this->hasMany(Follow::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function readingHistories(): HasMany
    {
        return $this->hasMany(ReadingHistory::class);
    }
}
