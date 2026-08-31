<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserXp extends Model
{
    use HasFactory;

    protected $table = 'user_xp';

    protected $fillable = ['user_id', 'total_xp', 'level', 'last_login_at'];

    protected $casts = [
        'last_login_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
