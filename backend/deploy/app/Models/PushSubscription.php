<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Subscription web push (Web Push API) milik seorang user.
 * Endpoint + keys (p256dh, auth) dikirim browser saat user mengaktifkan
 * notifikasi; dipakai backend untuk mengirim push via VAPID.
 */
class PushSubscription extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'user_id', 'endpoint', 'keys', 'user_agent'];

    protected $casts = [
        'keys' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (PushSubscription $subscription) {
            if (empty($subscription->id)) {
                $subscription->id = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
