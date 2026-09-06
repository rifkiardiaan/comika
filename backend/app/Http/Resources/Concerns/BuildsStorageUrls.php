<?php

namespace App\Http\Resources\Concerns;

use Illuminate\Http\Request;

/**
 * Helper URL untuk file storage (cover, halaman episode, banner).
 *
 * Selalu membangun URL dari HOST request yang sedang dipakai pengguna,
 * BUKAN dari konfigurasi APP_URL — karena APP_URL di banyak hosting
 * sering salah (localhost, domain lama, http/https tidak sinkron) yang
 * membuat gambar/unduhan offline gagal dimuat di browser pengguna.
 *
 * Contoh: path "comic-covers/x.jpg" → https://host-saat-ini/storage/comic-covers/x.jpg
 */
trait BuildsStorageUrls
{
    protected function storageUrl(Request $request, ?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return $request->getSchemeAndHttpHost().'/storage/'.ltrim($path, '/');
    }
}