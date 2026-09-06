<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateComicStatusRequest;
use App\Http\Resources\AdminComicResource;
use App\Models\ActivityLog;
use App\Models\Comic;
use App\Models\CreatorEarning;
use App\Models\Episode;
use App\Services\ActivityLogService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class AdminComicController extends Controller
{
    /**
     * Daftar semua komik (termasuk draft) dengan pencarian & filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Comic::query()
            ->with('creator:id,name')
            ->withCount('episodes');

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('synopsis', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('visibility')) {
            $visibility = $request->visibility;
            if ($visibility === 'published') {
                $query->whereNotNull('published_at');
            } elseif ($visibility === 'draft') {
                $query->whereNull('published_at');
            }
        }

        // Filter berdasarkan verification_status — handle jika kolom belum ada
        if ($request->filled('verification')) {
            $verification = $request->verification;

            // Page 'Diblokir' → komik dengan status 'blocked' (verification),
            // benar-benar terpisah dari Ditolak (rejected).
            if ($verification === 'blocked') {
                try {
                    $query->where('verification_status', Comic::VERIFICATION_BLOCKED);
                } catch (\Throwable $e) {
                    // Kolom belum ada — abaikan filter
                }
            } else {
                try {
                    $query->where('verification_status', $verification);
                } catch (\Throwable $e) {
                    // Kolom belum ada — abaikan filter
                }
            }
        }

        $comics = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => AdminComicResource::collection($comics->items()),
            'meta' => [
                'current_page' => $comics->currentPage(),
                'last_page' => $comics->lastPage(),
                'per_page' => $comics->perPage(),
                'total' => $comics->total(),
            ],
        ]);
    }

    /**
     * Daftar episode untuk komik tertentu (termasuk draft) — admin only.
     */
    public function episodes(Comic $comic): JsonResponse
    {
        $episodes = $comic->episodes()
            ->withCount('pages')
            ->orderBy('number')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'comic' => [
                    'id' => $comic->id,
                    'title' => $comic->title,
                    // Status persetujuan komik — episode baru boleh disetujui
                    // setelah komik disetujui & diterbitkan (approved + published_at).
                    'verification_status' => $comic->verification_status ?? 'pending',
                    'published_at' => $comic->published_at?->toIso8601String(),
                ],
                'episodes' => $episodes->map(fn (Episode $ep) => [
                    'id' => $ep->id,
                    'number' => $ep->number,
                    'title' => $ep->title,
                    'status' => $ep->status,
                    'is_premium' => $ep->is_premium,
                    'price_coin' => $ep->price_coin,
                    'view_count' => $ep->view_count,
                    'like_count' => $ep->like_count,
                    'page_count' => $ep->pages_count,
                    'comments_count' => $ep->comments()->count(),
                    'published_at' => $ep->published_at?->toIso8601String(),
                    'rejection_reason' => \Schema::hasColumn('episodes', 'rejection_reason')
                        ? ($ep->rejection_reason ?? null)
                        : null,
                ])->values(),
            ],
        ]);
    }

    /**
     * Halaman episode tertentu — admin only.
     * Untuk melihat isi komik sebelum dipublish.
     */
    public function episodePages(Episode $episode): JsonResponse
    {
        $pages = $episode->pages()
            ->orderBy('page_number')
            ->get()
            ->map(fn ($page) => [
                'id' => $page->id,
                'page_number' => $page->page_number,
                'image_url' => asset('storage/' . $page->image_url),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'episode' => [
                    'id' => $episode->id,
                    'number' => $episode->number,
                    'title' => $episode->title,
                    'status' => $episode->status,
                    'is_premium' => $episode->is_premium,
                    'rejection_reason' => \Schema::hasColumn('episodes', 'rejection_reason')
                        ? ($episode->rejection_reason ?? null)
                        : null,
                ],
                'pages' => $pages,
            ],
        ]);
    }

    /**
     * Publish komik — hanya admin yang bisa mempublish.
     * Creator tidak bisa publish sendiri.
     */
    public function publish(Comic $comic): JsonResponse
    {
        // Komik yang sudah disetujui & terbit tidak perlu dipublish ulang.
        // Komik yang terbit tapi belum disetujui (dari alur lama) tetap bisa disetujui di sini.
        if ($comic->published_at && $comic->verification_status === Comic::VERIFICATION_APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Komik sudah dipublikasikan.',
            ], 422);
        }

        $comic->update([
            'published_at' => now(),
            'verification_status' => Comic::VERIFICATION_APPROVED,
            'rejection_reason' => null,
        ]);

        // Backup: pastikan verification_status terupdate via raw query
        try {
            DB::table('comics')->where('id', $comic->id)->update([
                'verification_status' => 'approved',
                'rejection_reason' => null,
            ]);
        } catch (\Throwable $e) {
            // Kolom belum ada — abaikan
        }

        // CATATAN: episode TIDAK ikut diterbitkan otomatis di sini.
        // Persetujuan publish komik dilakukan per episode — admin menyetujui
        // setiap episode lewat tombol "Setujui" di dashboard Laporan Komik.
        // Episode berstatus draft/pending hanya tampil publik setelah
        // disetujui satu per satu oleh admin (AdminComicController::publishEpisode).

        // Notifikasi ke creator bahwa komiknya sudah disetujui & diterbitkan
        app(NotificationService::class)->send(
            $comic->creator_id,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $comic->id,
                'comic_title' => $comic->title,
                'status' => 'published',
                'message' => 'Komik "' . $comic->title . '" telah disetujui & diterbitkan oleh admin. Setiap episode perlu disetujui terlebih dahulu agar tampil publik.',
            ]
        );

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            auth()->user(),
            ActivityLog::ACTION_COMIC_PUBLISH,
            'Admin menerbitkan komik "' . $comic->title . '"',
            $comic,
            [],
            request()->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil dipublikasikan oleh admin.',
            'data' => new AdminComicResource(
                $comic->load('creator:id,name')->loadCount('episodes')
            ),
        ]);
    }

    /**
     * Verifikasi komik — admin approve/reject upload komik creator.
     */
    public function verify(Request $request, Comic $comic): JsonResponse
    {
        $validated = $request->validate([
            'verification_status' => 'required|in:approved,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $comic->update([
            'verification_status' => $validated['verification_status'],
            'rejection_reason' => $validated['verification_status'] === 'rejected'
                ? ($validated['rejection_reason'] ?? 'Tidak disetujui oleh admin')
                : null,
        ]);

        // Backup: pastikan verification_status terupdate via raw query
        try {
            DB::table('comics')->where('id', $comic->id)->update([
                'verification_status' => $validated['verification_status'],
                'rejection_reason' => $validated['verification_status'] === 'rejected'
                    ? ($validated['rejection_reason'] ?? 'Tidak disetujui oleh admin')
                    : null,
            ]);
        } catch (\Throwable $e) {
            // Kolom belum ada — abaikan
        }

        // Notifikasi ke creator
        $statusMessage = $validated['verification_status'] === 'approved'
            ? 'Komik "' . $comic->title . '" telah disetujui.'
            : 'Komik "' . $comic->title . '" ditolak.' . ($validated['rejection_reason'] ?? '');

        app(NotificationService::class)->send(
            $comic->creator_id,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $comic->id,
                'comic_title' => $comic->title,
                'verification_status' => $validated['verification_status'],
                'rejection_reason' => $validated['rejection_reason'] ?? null,
                'message' => $statusMessage,
            ]
        );

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            auth()->user(),
            $validated['verification_status'] === 'approved'
                ? ActivityLog::ACTION_COMIC_VERIFY
                : ActivityLog::ACTION_COMIC_BAN,
            ($validated['verification_status'] === 'approved'
                ? 'Admin menyetujui komik "'
                : 'Admin menolak komik "') . $comic->title . '"',
            $comic,
            ['verification_status' => $validated['verification_status'], 'rejection_reason' => $validated['rejection_reason'] ?? null],
            request()->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi komik berhasil diperbarui.',
            'data' => new AdminComicResource(
                $comic->load('creator:id,name')->loadCount('episodes')
            ),
        ]);
    }

    /**
     * Ubah status komik (ongoing / completed / hiatus).
     */
    public function updateStatus(UpdateComicStatusRequest $request, Comic $comic): JsonResponse
    {
        $previous = $comic->status;
        $comic->update(['status' => $request->status]);

        // Beri tahu creator bila status komiknya diubah admin
        if ($previous !== $request->status) {
            app(NotificationService::class)->send(
                $comic->creator_id,
                NotificationService::TYPE_COMIC_UPDATE,
                [
                    'comic_id' => $comic->id,
                    'comic_title' => $comic->title,
                    'status' => $request->status,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Status komik berhasil diperbarui.',
            'data' => new AdminComicResource(
                $comic->load('creator:id,name')->loadCount('episodes')
            ),
        ]);
    }

    /**
     * Publish episode — hanya admin yang bisa publish.
     *
     * Alur moderasi: komik HARUS disetujui (verification_status = approved &
     * published_at terisi) terlebih dahulu lewat tombol "Publish" pada kartu
     * komik, BARU episode-nya boleh disetujui satu per satu di sini.
     */
    public function publishEpisode(Request $request, Episode $episode): JsonResponse
    {
        $comic = $episode->comic;

        // Komik belum disetujui/diterbitkan → episode belum boleh terbit.
        // Admin harus menyetujui komik terlebih dahulu (Publish pada kartu komik).
        if ($comic->verification_status !== Comic::VERIFICATION_APPROVED || ! $comic->published_at) {
            return response()->json([
                'success' => false,
                'message' => 'Setujui komik terlebih dahulu (tombol Publish pada kartu komik) sebelum menerbitkan episode-nya.',
            ], 422);
        }

        if ($episode->status === Episode::STATUS_PUBLISHED) {
            return response()->json([
                'success' => false,
                'message' => 'Episode sudah dipublikasikan.',
            ], 422);
        }

        if ($episode->pages()->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Episode harus memiliki minimal 1 halaman sebelum dipublikasikan.',
            ], 422);
        }

        $episode->update([
            'status' => Episode::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        // Kolom rejection_reason opsional — beberapa DB produksi belum punya
        if (\Schema::hasColumn('episodes', 'rejection_reason')) {
            $episode->update(['rejection_reason' => null]);
        }

        // Pastikan komik berstatus ongoing karena sudah punya episode terbit.
        $comic->update([
            'status' => Comic::STATUS_ONGOING,
            'published_at' => $comic->published_at ?? now(),
        ]);

        // Notifikasi ke creator
        app(NotificationService::class)->send(
            $episode->comic->creator_id,
            NotificationService::TYPE_NEW_EPISODE,
            [
                'comic_id' => $episode->comic_id,
                'comic_title' => $episode->comic->title,
                'episode_id' => $episode->id,
                'episode_number' => $episode->number,
                'episode_title' => $episode->title,
                'message' => 'Episode "' . $episode->title . '" telah dipublikasikan oleh admin.',
            ]
        );

        // Notifikasi ke semua follower komik (episode baru terbit)
        app(NotificationService::class)->notifyNewEpisode($episode);

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            auth()->user(),
            ActivityLog::ACTION_EPISODE_PUBLISH,
            'Admin menerbitkan episode ' . $episode->number . ' "' . $episode->title . '" dari komik "' . $comic->title . '"',
            $episode,
            ['comic_id' => $comic->id],
            request()->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Episode berhasil dipublikasikan oleh admin.',
            'data' => [
                'id' => $episode->id,
                'title' => $episode->title,
                'number' => $episode->number,
                'status' => Episode::STATUS_PUBLISHED,
            ],
        ]);
    }

    /**
     * Tolak episode — episode otomatis DIHAPUS.
     * Creator menerima notifikasi berisi alasan penolakan, lalu bisa
     * mengunggah episode baru (nomor lama otomatis bebas dipakai lagi).
     * Episode yang sudah terbit ikut dihapus & tidak lagi tampil publik.
     */
    public function rejectEpisode(Request $request, Episode $episode): JsonResponse
    {
        $note = trim((string) $request->input('reason', ''));
        if (mb_strlen($note) > 500) {
            $note = mb_substr($note, 0, 500);
        }

        $wasPublished = $episode->status === Episode::STATUS_PUBLISHED;

        // Beri tahu creator alasan penolakan SEBELUM episode dihapus
        app(NotificationService::class)->send(
            $episode->comic->creator_id,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $episode->comic_id,
                'comic_title' => $episode->comic->title,
                'episode_id' => $episode->id,
                'episode_number' => $episode->number,
                'episode_title' => $episode->title,
                'status' => 'rejected',
                'message' => 'Episode "' . $episode->title . '" ditolak dan dihapus oleh admin'
                    . ($note !== '' ? ' — ' . $note : '')
                    . '. Silakan unggah ulang episode dengan perbaikan.',
            ]
        );

        // Hapus episode beserta halaman & data terkait (semua FK cascade/null)
        $comic = $episode->comic;
        $episode->delete();

        $this->syncComicPublicationState($episode->comic_id);

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            auth()->user(),
            ActivityLog::ACTION_EPISODE_REJECT,
            'Admin menolak episode ' . $episode->number . ' "' . $episode->title . '" dari komik "' . $comic->title . '"'
                . ($note !== '' ? ' — ' . $note : ''),
            $comic,
            ['episode_id' => $episode->id, 'reason' => $note],
            request()->ip()
        );

        return response()->json([
            'success' => true,
            'message' => $wasPublished
                ? 'Episode ditolak & dihapus — tidak lagi tampil publik.'
                : 'Episode ditolak & dihapus.',
            'data' => [
                'id' => $episode->id,
                'number' => $episode->number,
                'title' => $episode->title,
                'status' => 'deleted',
            ],
        ]);
    }

    /**
     * Hapus episode dari dashboard Laporan Komik (admin).
     * Episode dihapus permanen beserta halaman & data terkait.
     */
    public function destroyEpisode(Episode $episode): JsonResponse
    {
        // Beri tahu creator bahwa episodenya dihapus admin (terbit maupun belum)
        app(NotificationService::class)->send(
            $episode->comic->creator_id,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $episode->comic_id,
                'comic_title' => $episode->comic->title,
                'episode_id' => $episode->id,
                'episode_number' => $episode->number,
                'episode_title' => $episode->title,
                'status' => 'deleted',
                'message' => 'Episode "' . $episode->title . '" dihapus oleh admin.'
                    . ($episode->status === Episode::STATUS_PUBLISHED ? ' Episode tidak lagi tampil publik.' : ''),
            ]
        );

        $comic = $episode->comic;
        $episodeTitle = $episode->title;
        $episodeNumber = $episode->number;
        $comicTitle = $comic->title;
        $episode->delete();

        $this->syncComicPublicationState($episode->comic_id);

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            auth()->user(),
            ActivityLog::ACTION_EPISODE_DELETE,
            'Admin menghapus episode ' . $episodeNumber . ' "' . $episodeTitle . '" dari komik "' . $comicTitle . '"',
            $comic,
            ['episode_id' => $episode->id],
            request()->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Episode berhasil dihapus.',
            'data' => null,
        ]);
    }

    /**
     * Sinkronkan status publikasi komik: bila tidak ada lagi episode yang
     * terbit, komik tidak lagi tampil publik (published_at null & status
     * kembali ke kondisi review/ongoing).
     */
    private function syncComicPublicationState(int $comicId): void
    {
        $comic = Comic::find($comicId);
        if (! $comic) {
            return;
        }

        $stillHasPublished = Episode::where('comic_id', $comicId)
            ->where('status', Episode::STATUS_PUBLISHED)
            ->exists();

        if ($comic->published_at && ! $stillHasPublished) {
            $comic->update([
                'published_at' => null,
                'status' => Comic::STATUS_ONGOING,
            ]);
        }
    }

    /**
     * Blokir komik — tidak bisa dibaca oleh user lain.
     *
     * Creator TETAP bisa login (akun tidak diblokir), namun izin
     * upload komik diberhentikan (can_upload = false). Admin dapat
     * mengaktifkan kembali izin upload lewat Manajemen Pengguna.
     */
    public function block(Request $request, Comic $comic): JsonResponse
    {
        $note = trim((string) $request->input('reason', ''));
        if (mb_strlen($note) > 500) {
            $note = mb_substr($note, 0, 500);
        }

        $comic->update([
            'published_at' => null,
            'verification_status' => Comic::VERIFICATION_BLOCKED,
            'rejection_reason' => $note !== '' ? $note : 'Komik diblokir oleh admin.',
        ]);

        // Backup: pastikan verification_status terupdate via raw query
        try {
            DB::table('comics')->where('id', $comic->id)->update([
                'verification_status' => 'blocked',
                'rejection_reason' => $note !== '' ? $note : 'Komik diblokir oleh admin.',
            ]);
        } catch (\Throwable $e) {
            // Kolom belum ada — abaikan
        }

        // Unpublish semua episode
        Episode::where('comic_id', $comic->id)
            ->where('status', Episode::STATUS_PUBLISHED)
            ->update(['status' => Episode::STATUS_DRAFT]);

        // Nonaktifkan izin upload creator — tetap bisa login, tidak bisa upload komik lagi.
        if ($comic->creator_id) {
            try {
                DB::table('users')->where('id', $comic->creator_id)->update(['can_upload' => false]);
            } catch (\Throwable $e) {
                // Kolom belum ada — abaikan
            }
        }

        // Notifikasi ke creator
        app(NotificationService::class)->send(
            $comic->creator_id,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $comic->id,
                'comic_title' => $comic->title,
                'status' => 'blocked',
                'message' => 'Komik "' . $comic->title . '" telah diblokir oleh admin. Akun Anda masih bisa login, namun izin upload komik dinonaktifkan. Hubungi admin bila ingin mengaktifkannya kembali.',
            ]
        );

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            auth()->user(),
            ActivityLog::ACTION_COMIC_BLOCK,
            'Admin memblokir komik "' . $comic->title . '"' . ($note !== '' ? ' — ' . $note : '') . '. Izin upload creator dinonaktifkan.',
            $comic,
            ['reason' => $note !== '' ? $note : null],
            request()->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil diblokir & izin upload creator dinonaktifkan.',
            'data' => new AdminComicResource(
                $comic->load('creator:id,name')->loadCount('episodes')
            ),
        ]);
    }

    /**
     * Hapus cover komik — set cover_url ke null & hapus file fisik.
     */
    public function deleteCover(Comic $comic): JsonResponse
    {
        if (! $comic->cover_url) {
            return response()->json([
                'success' => false,
                'message' => 'Komik ini tidak memiliki cover.',
            ], 422);
        }

        // Hapus file fisik jika ada
        $path = storage_path('app/public/'.$comic->cover_url);
        if (File::exists($path)) {
            File::delete($path);
        }

        $comic->update(['cover_url' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Cover komik berhasil dihapus.',
            'data' => new AdminComicResource(
                $comic->load('creator:id,name')->loadCount('episodes')
            ),
        ]);
    }

    /**
     * Hapus komik (soft delete) — moderasi.
     */
    public function destroy(Comic $comic): JsonResponse
    {
        $title = $comic->title;
        $creatorId = $comic->creator_id;
        $comicId = $comic->id;

        // Beri tahu creator bahwa komiknya dihapus admin
        app(NotificationService::class)->send(
            $creatorId,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $comicId,
                'comic_title' => $title,
                'status' => 'deleted',
                'message' => 'Komik "' . $title . '" dihapus oleh admin dan tidak lagi tampil publik.',
            ]
        );

        $comic->delete();

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            auth()->user(),
            ActivityLog::ACTION_COMIC_BAN,
            'Admin menghapus komik "' . $title . '"',
            null,
            ['comic_id' => $comic->id, 'reason' => 'deleted'],
            request()->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil dihapus.',
            'data' => null,
        ]);
    }

    /**
     * Pendapatan admin dari komik (revenue dari platform).
     * Admin mendapatkan 40% dari setiap unlock episode premium.
     */
    public function revenue(Request $request): JsonResponse
    {
        $totalRevenue = (float) DB::table('transactions')
            ->where('type', 'episode_unlock')
            ->where('status', 'success')
            ->sum('coins') * 100 * 0.40;

        $monthlyRevenue = (float) DB::table('transactions')
            ->where('type', 'episode_unlock')
            ->where('status', 'success')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('coins') * 100 * 0.40;

        $totalCoinRevenue = (int) DB::table('transactions')
            ->where('type', 'episode_unlock')
            ->where('status', 'success')
            ->sum('coins');

        $adminSharePerCoin = 100 * 0.40; // 40% dari Rp 100 per koin
        $totalPlatformRevenue = $totalCoinRevenue * $adminSharePerCoin;

        // Revenue per komik
        $revenueByComic = DB::table('creator_earnings')
            ->join('episodes', 'creator_earnings.episode_id', '=', 'episodes.id')
            ->join('comics', 'episodes.comic_id', '=', 'comics.id')
            ->select(
                'comics.id as comic_id',
                'comics.title as comic_title',
                DB::raw('SUM(creator_earnings.amount) as total_creator_earnings'),
                DB::raw('SUM(creator_earnings.amount * 0.40 / 0.60) as total_revenue')
            )
            ->groupBy('comics.id', 'comics.title')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'total_revenue' => round($totalPlatformRevenue, 2),
                'monthly_revenue' => round($monthlyRevenue, 2),
                'total_coin_revenue' => $totalCoinRevenue,
                'revenue_by_comic' => $revenueByComic,
            ],
        ]);
    }
}
