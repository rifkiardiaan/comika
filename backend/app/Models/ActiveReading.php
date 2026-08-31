<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActiveReading extends Model
{
    use HasFactory;

    protected $table = 'active_readers';

    protected $fillable = [
        'user_id',
        'comic_id',
        'episode_id',
        'last_page',
        'progress',
        'last_heartbeat_at',
    ];

    protected $casts = [
        'last_heartbeat_at' => 'datetime',
        'progress' => 'decimal:2',
    ];

    /**
     * Detik sejak heartbeat terakhir — dipakai untuk menentukan apakah
     * session masih dianggap aktif.
     */
    const STALE_SECONDS = 90;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comic(): BelongsTo
    {
        return $this->belongsTo(Comic::class);
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}
