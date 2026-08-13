<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReadingStreak extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'current_streak', 'longest_streak', 'last_read_at'];

    protected $casts = [
        'last_read_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
