<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\StreamedResponse;
use Illuminate\Support\Facades\File;

class DownloadController extends Controller
{
    private const APK_DIR = 'downloads';
    private const APK_FILENAME = 'comika.apk';
    private const APP_VERSION = '1.0.0';
    private const MIN_ANDROID = '7.0';

    /**
     * Info versi APK — agar app bisa cek update.
     */
    public function version(): JsonResponse
    {
        $apkPath = public_path(self::APK_DIR . '/' . self::APK_FILENAME);
        $exists = File::exists($apkPath);
        $size = $exists ? File::size($apkPath) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'version' => self::APP_VERSION,
                'min_android' => self::MIN_ANDROID,
                'file_size' => $size,
                'file_size_human' => $this->humanSize($size),
                'available' => $exists,
                'download_url' => route('download.apk'),
            ],
        ]);
    }

    /**
     * Download APK file — dikirim langsung (binary file response).
     */
    public function download(): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        $apkPath = public_path(self::APK_DIR . '/' . self::APK_FILENAME);

        if (!File::exists($apkPath)) {
            return response()->json([
                'success' => false,
                'message' => 'File APK belum tersedia. Silakan hubungi admin.',
            ], 404);
        }

        return response()->download($apkPath, self::APK_FILENAME, [
            'Cache-Control' => 'no-cache, must-revalidate',
            'Pragma' => 'no-cache',
        ]);
    }

    /**
     * Catat aktivitas "Download Offline" komik (feature 13) — dipanggil
     * web/app secara fire-and-forget setelah komik berhasil disimpan offline.
     * Endpoint tidak mengubah data apa pun; hanya mencatat riwayat.
     */
    public function logComicDownload(Request $request, \App\Models\Comic $comic): JsonResponse
    {
        $episodeCount = (int) $request->input('episode_count', 0);
        $pageCount = (int) $request->input('page_count', 0);

        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_COMIC_DOWNLOAD,
            $request->user()->name . ' mengunduh komik "' . $comic->title . '" untuk dibaca offline (' . $episodeCount . ' episode, ' . $pageCount . ' halaman)',
            $comic,
            ['episode_count' => $episodeCount, 'page_count' => $pageCount],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Download tercatat.',
        ]);
    }

    /**
     * Placeholder untuk upload APK (admin only).
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'apk' => 'required|file|mimes:apk|max:104857600', // max 100MB
        ]);

        $dir = public_path(self::APK_DIR);
        if (!File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        // Hapus APK lama
        $oldPath = $dir . '/' . self::APK_FILENAME;
        if (File::exists($oldPath)) {
            File::delete($oldPath);
        }

        // Simpan APK baru
        $request->file('apk')->move($dir, self::APK_FILENAME);

        $size = File::size($dir . '/' . self::APK_FILENAME);

        return response()->json([
            'success' => true,
            'message' => 'APK berhasil diupload.',
            'data' => [
                'version' => self::APP_VERSION,
                'file_size' => $size,
                'file_size_human' => $this->humanSize($size),
            ],
        ]);
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }
}
