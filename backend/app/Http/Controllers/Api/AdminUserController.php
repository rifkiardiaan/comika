<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\AdminUserResource;
use App\Models\Subscription;
use App\Models\User;
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

        $user->update(['role' => $request->role]);

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

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus.',
            'data' => null,
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
