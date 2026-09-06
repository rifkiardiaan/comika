<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\AdminUserResource;
use App\Models\ActivityLog;
use App\Models\Subscription;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    /**
     * Daftar semua user dengan pencarian & filter role.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->withCount('comics');

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => AdminUserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Ubah role user — admin tidak dapat mengubah role akun sendiri.
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah role akun sendiri.',
                'errors' => (object) [],
            ], 422);
        }

        $oldRole = $user->role;
        $user->update(['role' => $request->role]);

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_USER_ROLE,
            'Admin mengubah role ' . $user->name . ' dari ' . $oldRole . ' menjadi ' . $user->role,
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'Role user berhasil diperbarui.',
            'data' => new AdminUserResource($user->loadCount('comics')),
        ]);
    }

    /**
     * Hapus user (soft delete) — tidak dapat menghapus akun sendiri.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus akun sendiri.',
                'errors' => (object) [],
            ], 422);
        }

        $name = $user->name;
        $user->delete();

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_USER_PERMANENT_BAN,
            'Admin menghapus akun user ' . $name,
            null,
            ['user_id' => $user->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus.',
            'data' => null,
        ]);
    }

    /**
     * Blokir akun user (sementara) — tidak bisa login.
     */
    public function ban(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat memblokir akun sendiri.',
            ], 422);
        }

        $request->validate([
            'ban_reason' => 'nullable|string|max:500',
        ]);

        DB::table('users')->where('id', $user->id)->update([
            'is_banned' => true,
            'ban_reason' => $request->input('ban_reason', 'Diblokir oleh admin'),
        ]);

        // Revoke semua token sanctum agar user langsung logout
        $user->tokens()->delete();

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_USER_BAN,
            'Admin memblokir sementara akun ' . $user->name . ($request->input('ban_reason') ? ' — ' . $request->input('ban_reason') : ''),
            $user
        );

        return response()->json([
            'success' => true,
            'message' => "Akun {$user->name} berhasil diblokir sementara.",
            'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
        ]);
    }

    /**
     * Buka blokir akun user — mengembalikan akses login penuh.
     * Membersihkan ban sementara maupun permanent (admin bisa
     * mengaktifkan kembali login untuk user yang di-ban permanen).
     */
    public function unban(Request $request, User $user): JsonResponse
    {
        DB::table('users')->where('id', $user->id)->update([
            'is_banned' => false,
            'is_permanently_banned' => false,
            'ban_reason' => null,
        ]);

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_USER_UNBAN,
            'Admin membuka blokir akun ' . $user->name,
            $user
        );

        return response()->json([
            'success' => true,
            'message' => "Blokir akun {$user->name} berhasil dibuka.",
            'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
        ]);
    }

    /**
     * Atur izin upload komik seorang user (biasanya creator).
     * Saat komik diblokir, izin upload otomatis dimatikan; admin
     * bisa menyalakannya kembali kapan saja di sini.
     */
    public function setUploadPermission(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah izin upload akun sendiri.',
            ], 422);
        }

        $validated = $request->validate([
            'can_upload' => 'required|boolean',
        ]);

        $allowed = (bool) $validated['can_upload'];

        DB::table('users')->where('id', $user->id)->update([
            'can_upload' => $allowed ? 1 : 0,
        ]);

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            $allowed ? ActivityLog::ACTION_USER_UNBAN : ActivityLog::ACTION_USER_BAN,
            ($allowed ? 'Admin mengizinkan kembali upload komik ' : 'Admin menonaktifkan upload komik ') . $user->name,
            $user
        );

        return response()->json([
            'success' => true,
            'message' => $allowed
                ? "Izin upload komik {$user->name} berhasil diaktifkan kembali."
                : "Izin upload komik {$user->name} berhasil dinonaktifkan.",
            'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
        ]);
    }

    /**
     * Blokir permanent akun user — tidak bisa login sama sekali.
     */
    public function permanentBan(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat memblokir permanen akun sendiri.',
            ], 422);
        }

        $request->validate([
            'ban_reason' => 'required|string|max:500',
        ]);

        DB::table('users')->where('id', $user->id)->update([
            'is_banned' => true,
            'is_permanently_banned' => true,
            'ban_reason' => $request->input('ban_reason'),
        ]);

        // Revoke semua token sanctum
        $user->tokens()->delete();

        // Hapus semua data terkait (soft delete komik)
        $user->comics()->delete();

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_USER_PERMANENT_BAN,
            'Admin memblokir permanen akun ' . $user->name . ' — ' . $request->input('ban_reason'),
            $user
        );

        return response()->json([
            'success' => true,
            'message' => "Akun {$user->name} berhasil diblokir permanen.",
            'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
        ]);
    }

    /**
     * Daftar user dengan langganan aktif (Premium/VVIP).
     */
    public function subscribers(Request $request): JsonResponse
    {
        $query = User::query()
            ->where(function ($q) {
                $q->where('is_premium', true)
                    ->orWhere('is_vvip', true);
            })
            ->withCount('comics');

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tier')) {
            $tier = $request->tier;
            if ($tier === 'vvip') {
                $query->where('is_vvip', true);
            } elseif ($tier === 'premium') {
                $query->where('is_premium', true)->where('is_vvip', false);
            }
        }

        $users = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => AdminUserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Grant VVIP status to a user (admin action).
     * Sets VVIP for the specified number of days from now.
     */
    public function grantVvip(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:3650',
        ]);

        $days = $request->integer('days');

        DB::beginTransaction();
        try {
            $expiresAt = now()->addDays($days);

            // If user already has active VVIP, extend from current expiry
            if ($user->is_vvip && $user->vvip_until && $user->vvip_until->isFuture()) {
                $expiresAt = $user->vvip_until->addDays($days);
            }

            $user->update([
                'is_premium' => true,
                'premium_until' => $expiresAt,
                'is_vvip' => true,
                'vvip_until' => $expiresAt,
            ]);

            // Also create a subscription record
            Subscription::create([
                'user_id' => $user->id,
                'plan' => Subscription::PLAN_VVIP_MONTHLY,
                'amount' => 0,
                'payment_method' => 'admin_grant',
                'payment_status' => Subscription::STATUS_PAID,
                'starts_at' => now(),
                'expires_at' => $expiresAt,
                'paid_at' => now(),
            ]);

            DB::commit();

            // Riwayat aktivitas
            app(ActivityLogService::class)->log(
                $request->user(),
                ActivityLog::ACTION_SUBSCRIPTION,
                'Admin memberikan VVIP ke ' . $user->name . ' selama ' . $days . ' hari',
                $user
            );

            return response()->json([
                'success' => true,
                'message' => "VVIP berhasil diberikan ke {$user->name} selama {$days} hari.",
                'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memberikan VVIP.',
            ], 500);
        }
    }

    /**
     * Revoke VVIP status from a user (admin action).
     */
    public function revokeVvip(Request $request, User $user): JsonResponse
    {
        $user->update([
            'is_vvip' => false,
            'vvip_until' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "VVIP berhasil dicabut dari {$user->name}.",
            'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
        ]);
    }

    /**
     * Grant Premium status to a user (admin action).
     * Sets Premium for the specified number of days from now.
     */
    public function grantPremium(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:3650',
        ]);

        $days = $request->integer('days');

        DB::beginTransaction();
        try {
            $expiresAt = now()->addDays($days);

            // If user already has active Premium, extend from current expiry
            if ($user->is_premium && ! $user->is_vvip && $user->premium_until && $user->premium_until->isFuture()) {
                $expiresAt = $user->premium_until->addDays($days);
            }

            $user->update([
                'is_premium' => true,
                'premium_until' => $expiresAt,
            ]);

            // Also create a subscription record
            Subscription::create([
                'user_id' => $user->id,
                'plan' => Subscription::PLAN_MONTHLY,
                'amount' => 0,
                'payment_method' => 'admin_grant',
                'payment_status' => Subscription::STATUS_PAID,
                'starts_at' => now(),
                'expires_at' => $expiresAt,
                'paid_at' => now(),
            ]);

            DB::commit();

            // Riwayat aktivitas
            app(ActivityLogService::class)->log(
                $request->user(),
                ActivityLog::ACTION_SUBSCRIPTION,
                'Admin memberikan Premium ke ' . $user->name . ' selama ' . $days . ' hari',
                $user
            );

            return response()->json([
                'success' => true,
                'message' => "Premium berhasil diberikan ke {$user->name} selama {$days} hari.",
                'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memberikan Premium.',
            ], 500);
        }
    }

    /**
     * Revoke Premium status from a user (admin action).
     */
    public function revokePremium(Request $request, User $user): JsonResponse
    {
        $user->update([
            'is_premium' => false,
            'premium_until' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Premium berhasil dicabut dari {$user->name}.",
            'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
        ]);
    }

    /**
     * Upgrade user dari Premium ke VVIP (admin action).
     */
    public function upgradeToVvip(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:3650',
        ]);

        $days = $request->integer('days');

        DB::beginTransaction();
        try {
            $expiresAt = now()->addDays($days);

            // If user already has active VVIP, extend from current expiry
            if ($user->is_vvip && $user->vvip_until && $user->vvip_until->isFuture()) {
                $expiresAt = $user->vvip_until->addDays($days);
            }

            $user->update([
                'is_premium' => true,
                'premium_until' => $expiresAt,
                'is_vvip' => true,
                'vvip_until' => $expiresAt,
            ]);

            // Create subscription record
            Subscription::create([
                'user_id' => $user->id,
                'plan' => Subscription::PLAN_VVIP_MONTHLY,
                'amount' => 0,
                'payment_method' => 'admin_grant',
                'payment_status' => Subscription::STATUS_PAID,
                'starts_at' => now(),
                'expires_at' => $expiresAt,
                'paid_at' => now(),
            ]);

            DB::commit();

            // Riwayat aktivitas
            app(ActivityLogService::class)->log(
                $request->user(),
                ActivityLog::ACTION_SUBSCRIPTION,
                'Admin meng-upgrade ' . $user->name . ' ke VVIP selama ' . $days . ' hari',
                $user
            );

            return response()->json([
                'success' => true,
                'message' => "VVIP berhasil diberikan ke {$user->name} selama {$days} hari.",
                'data' => new AdminUserResource($user->fresh()->loadCount('comics')),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memberikan VVIP.',
            ], 500);
        }
    }

    /**
     * Stats for VVIP & Premium subscribers.
     */
    public function subscriberStats(): JsonResponse
    {
        $vvipActive = User::where('is_vvip', true)
            ->where('vvip_until', '>', now())
            ->count();

        $premiumActive = User::where('is_premium', true)
            ->where('is_vvip', false)
            ->where('premium_until', '>', now())
            ->count();

        $total = User::where('is_premium', true)
            ->orWhere('is_vvip', true)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'vvip_active' => $vvipActive,
                'premium_active' => $premiumActive,
                'total' => $total,
            ],
        ]);
    }
}
