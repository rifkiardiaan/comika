<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Episode extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'comic_id',
        'title',
        'number',
        'status',
        'is_premium',
        'price_coin',
        'view_count',
        'like_count',
        'published_at',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function comic(): BelongsTo
    {
        return $this->belongsTo(Comic::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(EpisodePage::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function unlocks(): HasMany
    {
        return $this->hasMany(EpisodeUnlock::class);
    }

    public function creatorEarnings(): HasMany
    {
        return $this->hasMany(CreatorEarning::class);
    }
}
