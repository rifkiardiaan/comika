<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreatorApplication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreatorApplicationController extends Controller
{
    /**
     * User submit pengajuan menjadi creator.
     * POST /api/v1/creator-application
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Validasi: sudah creator?
        if ($user->role === User::ROLE_CREATOR) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu sudah berstatus creator.',
            ], 422);
        }

        // Validasi: sudah ada pengajuan pending?
        $existingPending = CreatorApplication::where('user_id', $user->id)
            ->where('status', CreatorApplication::STATUS_PENDING)
            ->exists();

        if ($existingPending) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu sudah mengajukan sebelumnya dan masih menunggu tinjauan.',
            ], 422);
        }

        // Validasi: sudah pernah submit dalam 3 hari terakhir?
        $recent = CreatorApplication::where('user_id', $user->id)
            ->whereIn('status', [CreatorApplication::STATUS_APPROVED, CreatorApplication::STATUS_REJECTED])
            ->where('created_at', '>=', now()->subDays(3))
            ->latest()
            ->first();

        if ($recent) {
            $daysLeft = ceil($recent->created_at->addDays(3)->diffInHours(now()) / 24);
            return response()->json([
                'success' => false,
                'message' => "Kamu sudah mengajukan baru-baru ini. Coba lagi dalam {$daysLeft} hari.",
            ], 422);
        }

        $validated = $request->validate([
            'bio' => 'required|string|max:300',
            'reason' => 'required|string|max:500',
            'experience' => 'nullable|string|max:300',
            'portfolio_url' => 'nullable|url|max:500',
        ]);

        $application = CreatorApplication::create([
            'user_id' => $user->id,
            'bio' => $validated['bio'],
            'reason' => $validated['reason'],
            'experience' => $validated['experience'] ?? null,
            'portfolio_url' => $validated['portfolio_url'] ?? null,
            'status' => CreatorApplication::STATUS_PENDING,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil dikirim. Tim admin akan meninjau dalam 1-3 hari kerja.',
            'data' => $application,
        ], 201);
    }

    /**
     * User melihat status pengajuan sendiri.
     * GET /api/v1/creator-application
     */
    public function show(Request $request): JsonResponse
    {
        $application = CreatorApplication::where('user_id', $request->user()->id)
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Admin: daftar semua pengajuan.
     * GET /api/v1/admin/creator-applications
     */
    public function index(Request $request): JsonResponse
    {
        $query = CreatorApplication::with(['user:id,name,username,email,avatar_url'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    /**
     * Admin: setujui pengajuan → role user jadi creator.
     * PATCH /api/v1/admin/creator-applications/{application}/approve
     */
    public function approve(Request $request, CreatorApplication $application): JsonResponse
    {
        if ($application->status !== CreatorApplication::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan ini sudah ditinjau.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $application->update([
                'status' => CreatorApplication::STATUS_APPROVED,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            // Update role user
            $application->user->update(['role' => User::ROLE_CREATOR]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pengajuan.',
            ], 500);
        }

        $application->load(['user:id,name,username,email,avatar_url', 'reviewer:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan disetujui. User telah menjadi creator.',
            'data' => $application,
        ]);
    }

    /**
     * Admin: tolak pengajuan.
     * PATCH /api/v1/admin/creator-applications/{application}/reject
     */
    public function reject(Request $request, CreatorApplication $application): JsonResponse
    {
        if ($application->status !== CreatorApplication::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan ini sudah ditinjau.',
            ], 422);
        }

        $request->validate([
            'review_note' => 'nullable|string|max:500',
        ]);

        $application->update([
            'status' => CreatorApplication::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'review_note' => $request->input('review_note'),
            'reviewed_at' => now(),
        ]);

        $application->load(['user:id,name,username,email,avatar_url', 'reviewer:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan ditolak.',
            'data' => $application,
        ]);
    }
}
