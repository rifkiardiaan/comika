<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EpisodePage extends Model
{
    use HasFactory;

    protected $fillable = ['episode_id', 'page_number', 'image_url'];

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}
