<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Genre extends Model
{
    use HasFactory;

    protected $fillable = ['slug', 'name'];

    public function comics(): BelongsToMany
    {
        return $this->belongsToMany(Comic::class, 'comic_genres');
    }
}
