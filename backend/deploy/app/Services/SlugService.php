<?php

namespace App\Services;

use Illuminate\Support\Str;

class SlugService
{
    /**
     * Buat slug unik dari string, otomatis menambah suffix angka jika bentrok.
     */
    public static function unique(string $title, string $table, string $column = 'slug', ?int $ignoreId = null): string
    {
        // Fallback jika judul hanya simbol/spasi sehingga slug kosong
        $base = Str::slug($title) ?: 'untitled';
        $slug = $base;
        $i = 2;

        while (self::exists($slug, $table, $column, $ignoreId)) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }

    private static function exists(string $slug, string $table, string $column, ?int $ignoreId): bool
    {
        $query = \DB::table($table)->where($column, $slug);
        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }
}
