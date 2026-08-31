<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateComicStatusRequest;
use App\Http\Resources\AdminComicResource;
use App\Models\Comic;
use App\Models\CreatorEarning;
use App\Models\Episode;
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
            try {
                $query->where('verification_status', $request->verification);
            } catch (\Throwable $e) {
                // Kolom belum ada — abaikan filter
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
        if ($comic->published_at) {
            return response()->json([
                'success' => false,
                'message' => 'Komik sudah dipublikasikan.',
            ], 422);
        }

        $comic->update([
            'published_at' => now(),
            'verification_status' => Comic::VERIFICATION_APPROVED,
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

        // Publish semua episode yang sudah siap (punya halaman)
        $draftEpisodes = Episode::where('comic_id', $comic->id)
            ->where('status', Episode::STATUS_DRAFT)
            ->whereHas('pages')
            ->get();

        foreach ($draftEpisodes as $episode) {
            $episode->update([
                'status' => Episode::STATUS_PUBLISHED,
                'published_at' => now(),
            ]);
        }

        // Notifikasi ke creator bahwa komiknya sudah dipublish
        app(NotificationService::class)->send(
            $comic->creator_id,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $comic->id,
                'comic_title' => $comic->title,
                'status' => 'published',
                'message' => 'Komik "' . $comic->title . '" telah dipublikasikan oleh admin.',
            ]
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
     */
    public function publishEpisode(Request $request, Episode $episode): JsonResponse
    {
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

        // Komik dianggap published begitu punya episode yang rilis
        $episode->comic()->update([
            'status' => 'ongoing',
            'published_at' => now(),
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
     * Blokir komik — tidak bisa dibaca oleh user lain.
     */
    public function block(Comic $comic): JsonResponse
    {
        $comic->update([
            'status' => Comic::STATUS_HIATUS,
            'published_at' => null,
            'verification_status' => Comic::VERIFICATION_REJECTED,
            'rejection_reason' => 'Komik diblokir oleh admin.',
        ]);

        // Backup: pastikan verification_status terupdate via raw query
        try {
            DB::table('comics')->where('id', $comic->id)->update([
                'verification_status' => 'rejected',
                'rejection_reason' => 'Komik diblokir oleh admin.',
            ]);
        } catch (\Throwable $e) {
            // Kolom belum ada — abaikan
        }

        // Unpublish semua episode
        Episode::where('comic_id', $comic->id)
            ->where('status', Episode::STATUS_PUBLISHED)
            ->update(['status' => Episode::STATUS_DRAFT]);

        // Notifikasi ke creator
        app(NotificationService::class)->send(
            $comic->creator_id,
            NotificationService::TYPE_COMIC_UPDATE,
            [
                'comic_id' => $comic->id,
                'comic_title' => $comic->title,
                'status' => 'blocked',
                'message' => 'Komik "' . $comic->title . '" telah diblokir oleh admin.',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Komik berhasil diblokir.',
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
        $comic->delete();

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
