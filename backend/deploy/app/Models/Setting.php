<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Pengaturan platform berbasis key-value.
 *
 * MVP disimpan di database (bukan cache/Redis) agar kompatibel dengan
 * shared hosting dan bisa diubah langsung dari dashboard admin tanpa
 * menjalankan perintah CLI.
 *
 * Tabel `platform_settings` dibuat otomatis (lazy) bila belum ada agar
 * aplikasi tidak gagal 500 di server yang migration-nya belum dijalankan
 * (mis. deploy baru tanpa import SQL). Setiap akses juga dibungkus
 * try/catch sehingga bila tabel benar-benar tidak bisa dibuat, aplikasi
 * tetap berjalan memakai nilai default.
 */
class Setting extends Model
{
    protected $table = 'platform_settings';

    protected $fillable = ['key', 'value'];

    public $timestamps = true;

    /** Nilai default pengaturan (dipakai saat tabel belum ada / belum di-seed). */
    private const DEFAULTS = [
        'revenue.creator_share' => 0.60,
        'revenue.admin_share' => 0.40,
        'revenue.coin_value' => 100,
    ];

    private static bool $tableReady = false;
    private static bool $tableChecked = false;

    /** Ambil nilai setting, atau $default bila belum ada. */
    public static function get(string $key, mixed $default = null): mixed
    {
        if (! self::tableAvailable()) {
            return $default;
        }

        try {
            $row = static::query()->where('key', $key)->first();

            return $row ? self::decode($row->value) : $default;
        } catch (Throwable) {
            return $default;
        }
    }

    /** Simpan/update nilai setting. */
    public static function set(string $key, mixed $value): void
    {
        if (! self::tableAvailable()) {
            return;
        }

        try {
            static::query()->updateOrCreate(
                ['key' => $key],
                ['value' => self::encode($value)]
            );
        } catch (Throwable) {
            // Abaikan: bila tabel belum tersedia, nilai default tetap dipakai.
        }
    }

    /** Timestamp terakhir dari sekumpulan kunci, atau null bila nggak ada. */
    public static function lastUpdated(array $keys): ?string
    {
        if (! self::tableAvailable()) {
            return null;
        }

        try {
            return static::query()->whereIn('key', $keys)->max('updated_at');
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * Pastikan tabel platform_settings ada (buat otomatis bila belum).
     * Hasil dicek sekali per proses untuk menghindari query berulang.
     */
    private static function tableAvailable(): bool
    {
        if (self::$tableChecked) {
            return self::$tableReady;
        }

        self::$tableChecked = true;
        self::$tableReady = false;

        try {
            if (! Schema::hasTable((new static)->getTable())) {
                Schema::create((new static)->getTable(), function (Blueprint $table) {
                    $table->id();
                    $table->string('key')->unique();
                    $table->text('value')->nullable();
                    $table->timestamps();
                });
                self::seedDefaults();
            }
            self::$tableReady = true;
        } catch (Throwable) {
            // Tidak bisa membuat tabel (mis. hak akses terbatas) →
            // aplikasi lanjut memakai nilai default.
            self::$tableReady = false;
        }

        return self::$tableReady;
    }

    /** Isi baris default bila tabel kosong. */
    private static function seedDefaults(): void
    {
        $now = now();
        foreach (self::DEFAULTS as $key => $value) {
            try {
                static::query()->insert([
                    'key' => $key,
                    'value' => self::encode($value),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } catch (Throwable) {
                // Abaikan bila kunci sudah ada (race condition).
            }
        }
    }

    private static function encode(mixed $value): string
    {
        return is_numeric($value) ? (string) $value : (string) json_encode($value);
    }

    private static function decode(?string $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}