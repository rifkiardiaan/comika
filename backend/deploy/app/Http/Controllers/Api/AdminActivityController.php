<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminActivityController extends Controller
{
    /**
     * Daftar riwayat aktivitas (feature 13) untuk dashboard admin.
     * Filter: action, q (nama user / deskripsi), date (YYYY-MM-DD),
     * actor_id (user tertentu), per_page.
     */
    public function index(Request $request): JsonResponse
    {
        // Tabel activity_logs belum ada (migrasi belum dijalankan) → beri info ramah
        if (! \Illuminate\Support\Facades\Schema::hasTable('activity_logs')) {
            return response()->json([
                'success' => true,
                'message' => 'Riwayat aktivitas belum tersedia. Jalankan migrasi activity_logs terlebih dahulu.',
                'data' => [],
                'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
                'available_actions' => [],
            ]);
        }

        $query = ActivityLog::query()
            ->with('user:id,name,username,avatar_url')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('actor_id')) {
            $query->where('user_id', (int) $request->actor_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%"));
            });
        }

        $logs = $query->paginate($request->integer('per_page', 15));

        // Daftar aksi yang pernah tercatat untuk dropdown filter
        $availableActions = ActivityLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $logs->getCollection()->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'username' => $log->user->username,
                    'avatar_url' => $log->user->avatar_url,
                ] : null,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'metadata' => $log->metadata,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->toIso8601String(),
            ])->values(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
            'available_actions' => $availableActions,
        ]);
    }
}
