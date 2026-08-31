<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EpisodeUnlock;
use App\Models\ReadingHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReadingController extends Controller
{
    /**
     * Laporan pembaca — tampil semua nama komik dan user yang telah membacanya.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ReadingHistory::query()
            ->with(['user:id,name,username,avatar_url,is_vvip', 'comic:id,title,cover_url', 'episode:id,title,number,is_premium,price_coin'])
            ->orderByDesc('updated_at');

        // Filter berdasarkan tipe baca
        if ($request->filled('type')) {
            $type = $request->type;
            if ($type === 'free') {
                $query->whereHas('episode', fn ($q) => $q->where('is_premium', false));
            } elseif ($type === 'paid') {
                $query->whereHas('episode', fn ($q) => $q->where('is_premium', true));
            } elseif ($type === 'vvip') {
                $query->whereHas('user', fn ($q) => $q->where('is_vvip', true))
                    ->whereHas('episode', fn ($q) => $q->where('is_premium', true));
            }
        }

        // Filter user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter komik
        if ($request->filled('comic_id')) {
            $query->where('comic_id', $request->comic_id);
        }

        // Pencarian nama user atau judul komik
        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('username', 'like', "%{$search}%"))
                    ->orWhereHas('comic', fn ($cq) => $cq->where('title', 'like', "%{$search}%"));
            });
        }

        $histories = $query->paginate($request->integer('per_page', 50));

        // Tambahkan info akses per reading history
        $data = $histories->getCollection()->map(function ($h) {
            $isPremium = $h->episode->is_premium ?? false;
            $isVvip = $h->user->is_vvip ?? false;

            // Cek apakah user unlock episode ini
            $isUnlocked = false;
            $coinsSpent = 0;
            if ($isPremium) {
                $unlock = EpisodeUnlock::where('user_id', $h->user_id)
                    ->where('episode_id', $h->episode_id)
                    ->first();
                if ($unlock) {
                    $isUnlocked = true;
                    $coinsSpent = $unlock->coins_spent;
                }
            }

            // Tentukan tipe akses
            $accessType = 'free';
            if ($isPremium && $isVvip) {
                $accessType = 'vvip';
            } elseif ($isPremium && $isUnlocked) {
                $accessType = 'paid';
            } elseif ($isPremium) {
                $accessType = 'premium_locked';
            }

            return [
                'id' => $h->id,
                'user' => [
                    'id' => $h->user_id,
                    'name' => $h->user?->name,
                    'username' => $h->user?->username,
                    'avatar_url' => $h->user?->avatar_url,
                    'is_vvip' => $isVvip,
                ],
                'comic' => [
                    'id' => $h->comic_id,
                    'title' => $h->comic?->title,
                    'cover_url' => $h->comic?->cover_url,
                ],
                'episode' => [
                    'id' => $h->episode_id,
                    'number' => $h->episode?->number,
                    'title' => $h->episode?->title,
                    'is_premium' => $isPremium,
                    'price_coin' => $h->episode?->price_coin ?? 0,
                ],
                'access_type' => $accessType,
                'coins_spent' => $coinsSpent,
                'progress' => $h->progress,
                'is_completed' => $h->is_completed,
                'last_page' => $h->last_page,
                'updated_at' => $h->updated_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $data,
            'meta' => [
                'current_page' => $histories->currentPage(),
                'last_page' => $histories->lastPage(),
                'per_page' => $histories->perPage(),
                'total' => $histories->total(),
            ],
        ]);
    }

    /**
     * Statistik ringkasan laporan pembaca.
     */
    public function stats(): JsonResponse
    {
        $totalReads = ReadingHistory::count();
        $uniqueReaders = ReadingHistory::distinct('user_id')->count('user_id');
        $uniqueComicsRead = ReadingHistory::distinct('comic_id')->count('comic_id');

        // Gratis vs berbayar
        $freeReads = ReadingHistory::whereHas('episode', fn ($q) => $q->where('is_premium', false))->count();
        $paidReads = ReadingHistory::whereHas('episode', fn ($q) => $q->where('is_premium', true))->count();

        // VVIP reads
        $vvipReads = ReadingHistory::whereHas('user', fn ($q) => $q->where('is_vvip', true))
            ->whereHas('episode', fn ($q) => $q->where('is_premium', true))
            ->count();

        // Total koin dari unlock
        $totalCoinsSpent = (int) EpisodeUnlock::sum('coins_spent');

        // Komik paling banyak dibaca
        $topComics = ReadingHistory::select('comic_id', DB::raw('COUNT(*) as read_count'))
            ->with('comic:id,title,cover_url')
            ->groupBy('comic_id')
            ->orderByDesc('read_count')
            ->limit(5)
            ->get();

        // User paling aktif
        $topReaders = ReadingHistory::select('user_id', DB::raw('COUNT(*) as read_count'))
            ->with('user:id,name,username,avatar_url')
            ->groupBy('user_id')
            ->orderByDesc('read_count')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'total_reads' => $totalReads,
                'unique_readers' => $uniqueReaders,
                'unique_comics_read' => $uniqueComicsRead,
                'free_reads' => $freeReads,
                'paid_reads' => $paidReads,
                'vvip_reads' => $vvipReads,
                'total_coins_spent' => $totalCoinsSpent,
                'top_comics' => $topComics,
                'top_readers' => $topReaders,
            ],
        ]);
    }
}
