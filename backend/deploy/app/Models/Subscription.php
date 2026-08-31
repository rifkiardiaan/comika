<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan',
        'amount',
        'payment_method',
        'payment_status',
        'starts_at',
        'expires_at',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public const PLAN_MONTHLY = 'monthly';
    public const PLAN_YEARLY = 'yearly';
    public const PLAN_VVIP_MONTHLY = 'vvip_monthly';
    public const PLAN_VVIP_YEARLY = 'vvip_yearly';

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_EXPIRED = 'expired';

    public const PRICES = [
        self::PLAN_MONTHLY => 29000,
        self::PLAN_YEARLY => 249000,
        self::PLAN_VVIP_MONTHLY => 99000,
        self::PLAN_VVIP_YEARLY => 699000,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === self::STATUS_PAID;
    }

    public function isActive(): bool
    {
        return $this->isPaid() && $this->expires_at->isFuture();
    }

    public function isVvip(): bool
    {
        return in_array($this->plan, [self::PLAN_VVIP_MONTHLY, self::PLAN_VVIP_YEARLY], true);
    }

    /**
     * Check if a user has an active premium subscription.
     */
    public static function isUserPremium(User $user): bool
    {
        if ($user->is_premium && $user->premium_until && $user->premium_until->isFuture()) {
            return true;
        }

        return static::where('user_id', $user->id)
            ->where('payment_status', self::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->exists();
    }

    /**
     * Check if a user has an active VVIP subscription.
     */
    public static function isUserVvip(User $user): bool
    {
        if ($user->is_vvip && $user->vvip_until && $user->vvip_until->isFuture()) {
            return true;
        }

        return static::where('user_id', $user->id)
            ->whereIn('plan', [self::PLAN_VVIP_MONTHLY, self::PLAN_VVIP_YEARLY])
            ->where('payment_status', self::STATUS_PAID)
            ->where('expires_at', '>', now())
            ->exists();
    }
}
