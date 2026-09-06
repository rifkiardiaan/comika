<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Riwayat aktivitas COMIKA (feature 13): catatan audit untuk upload,
 * verifikasi/publish, pembelian & unlock, download offline, dan
 * moderasi admin — semuanya dilihat admin di dashboard "Riwayat Aktivitas".
 *
 * Pencatatan bersifat best-effort: bila tabel activity_logs belum ada
 * (mis. di DB live sebelum migrasi dijalankan), aktivitas utama aplikasi
 * TIDAK BOLEH gagal karena log — cukup di-skip & diberi peringatan.
 */
class ActivityLogService
{
    /**
     * Catat satu aktivitas.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        User|int|null $actor,
        string $action,
        string $description,
        ?Model $subject = null,
        array $metadata = [],
        ?string $ipAddress = null
    ): ?ActivityLog {
        // Tidak mengganggu alur utama bila tabel belum dibuat (migrasi belum jalan)
        if (! Schema::hasTable('activity_logs')) {
            Log::info('[activity_logs] tabel belum ada, lewati pencatatan: '.$action);

            return null;
        }

        try {
            return ActivityLog::create([
                'user_id' => $actor instanceof User ? $actor->id : $actor,
                'action' => $action,
                'description' => $description,
                'subject_type' => $subject ? $subject->getMorphClass() : null,
                'subject_id' => $subject ? $subject->getKey() : null,
                'metadata' => $metadata,
                'ip_address' => $ipAddress,
            ]);
        } catch (\Throwable $e) {
            // Best-effort — jangan sampai membuat aksi utama ikut gagal.
            Log::warning('Gagal mencatat aktivitas: '.$action, ['error' => $e->getMessage()]);

            return null;
        }
    }

    /** Helper: log dari request aktif (user + IP otomatis). */
    public function logRequest(
        ?Request $request,
        string $action,
        string $description,
        ?Model $subject = null,
        array $metadata = []
    ): ?ActivityLog {
        $user = $request?->user();
        $ip = $request ? $request->ip() : null;

        return $this->log($user, $action, $description, $subject, $metadata, $ip);
    }
}
