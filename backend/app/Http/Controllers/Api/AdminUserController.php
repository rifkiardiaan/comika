<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\AdminUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
