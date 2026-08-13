<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoinPackage extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'coins', 'price', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
