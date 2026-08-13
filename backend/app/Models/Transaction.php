<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    public const TYPE_COIN_PURCHASE = 'coin_purchase';
    public const TYPE_EPISODE_UNLOCK = 'episode_unlock';
    public const TYPE_EARNING = 'earning';
    public const TYPE_WITHDRAWAL = 'withdrawal';

    public const STATUS_PENDING = 'pending';
    public const STATUS_SUCCESS = 'success';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';

    protected $fillable = [
        'user_id',
        'reference',
        'type',
        'status',
        'amount',
        'coins',
        'payment_method',
        'payment_ref',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function unlocks(): HasMany
    {
        return $this->hasMany(EpisodeUnlock::class);
    }
}
