<?php

namespace App\Services;

use App\Models\Setting;
use Carbon\Carbon;

/**
 * Pembagian pendapatan penjualan komik berbayar.
 *
 * Nilai disimpan di tabel `platform_settings` sehingga admin dapat
 * mengubah persentase share creator & platform langsung dari dashboard
 * tanpa deploy ulang. Bila belum tersimpan di database, dipakai nilai
 * default dari MonetizationService (60% creator / 40% platform).
 */
class RevenueShareService
{
    private const KEY_CREATOR_SHARE = 'revenue.creator_share';
    private const KEY_ADMIN_SHARE = 'revenue.admin_share';
    private const KEY_COIN_VALUE = 'revenue.coin_value';

    /** Bagian pendapatan untuk creator (0.0 – 1.0). */
    public function creatorShare(): float
    {
        return $this->bounded(
            Setting::get(self::KEY_CREATOR_SHARE, MonetizationService::CREATOR_SHARE),
            MonetizationService::CREATOR_SHARE,
            0.05,
            0.95
        );
    }

    /** Bagian pendapatan untuk platform/admin (0.0 – 1.0). */
    public function adminShare(): float
    {
        $computed = round(1 - $this->creatorShare(), 4);

        return $this->bounded(
            Setting::get(self::KEY_ADMIN_SHARE, $computed),
            $computed,
            0.05,
            0.95
        );
    }

    /** Nilai nominal 1 koin dalam rupiah. */
    public function coinValue(): int
    {
        $value = (int) Setting::get(self::KEY_COIN_VALUE, MonetizationService::COIN_VALUE);

        return $value > 0 ? $value : MonetizationService::COIN_VALUE;
    }

    /**
     * Simpan pembagian pendapatan.
     *
     * @param  float  $creatorShare  persentase creator (0.05–0.95)
     * @return array<string, mixed>
     */
    public function saveShares(float $creatorShare, ?int $coinValue = null): array
    {
        $creatorShare = round($this->bounded($creatorShare, MonetizationService::CREATOR_SHARE, 0.05, 0.95), 4);
        $adminShare = round(1 - $creatorShare, 4);

        Setting::set(self::KEY_CREATOR_SHARE, $creatorShare);
        Setting::set(self::KEY_ADMIN_SHARE, $adminShare);

        if ($coinValue !== null && $coinValue > 0) {
            Setting::set(self::KEY_COIN_VALUE, $coinValue);
        }

        return $this->settings();
    }

    /** Status pembagian pendapatan lengkap untuk dikirim ke frontend. */
    public function settings(): array
    {
        $updatedRaw = Setting::lastUpdated([
            self::KEY_CREATOR_SHARE,
            self::KEY_ADMIN_SHARE,
            self::KEY_COIN_VALUE,
        ]);

        return [
            'creator_share' => round($this->creatorShare(), 4),
            'admin_share' => round($this->adminShare(), 4),
            'coin_value' => $this->coinValue(),
            'updated_at' => $updatedRaw
                ? Carbon::parse($updatedRaw)->toIso8601String()
                : null,
        ];
    }

    private function bounded(mixed $value, float $default, float $min, float $max): float
    {
        $number = is_numeric($value) ? (float) $value : $default;

        return max($min, min($max, $number));
    }
}