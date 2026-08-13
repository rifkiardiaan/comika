<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminCreatorResource;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCreatorController extends Controller
{
    /**
     * Daftar creator dengan profil & statistik.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', User::ROLE_CREATOR)
            ->with('creatorProfile')
            ->withCount([
                'comics',
                'comics as published_comics_count' => fn ($q) => $q->whereNotNull('published_at'),
            ])
            ->withSum('comics as total_views', 'view_count');

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('verified')) {
            $verified = filter_var($request->verified, FILTER_VALIDATE_BOOLEAN);
            $query->whereHas('creatorProfile', fn ($q) => $q->where('is_verified', $verified));
        }

        $creators = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => AdminCreatorResource::collection($creators->items()),
            'meta' => [
                'current_page' => $creators->currentPage(),
                'last_page' => $creators->lastPage(),
                'per_page' => $creators->perPage(),
                'total' => $creators->total(),
            ],
        ]);
    }

    /**
     * Verifikasi / cabut verifikasi creator.
     */
    public function verify(Request $request, User $user): JsonResponse
    {
        if (! $user->isCreator()) {
            return response()->json([
                'success' => false,
                'message' => 'User tersebut bukan creator.',
                'errors' => (object) [],
            ], 422);
        }

        $verified = (bool) $request->boolean('verified');

        $profile = CreatorProfile::firstOrCreate(['user_id' => $user->id], [
            'display_name' => $user->name,
        ]);
        $profile->update(['is_verified' => $verified]);

        return response()->json([
            'success' => true,
            'message' => $verified
                ? 'Creator berhasil diverifikasi.'
                : 'Verifikasi creator dicabut.',
            'data' => new AdminCreatorResource(
                $user->load('creatorProfile')
                    ->loadCount([
                        'comics',
                        'comics as published_comics_count' => fn ($q) => $q->whereNotNull('published_at'),
                    ])
                    ->loadSum('comics as total_views', 'view_count')
            ),
        ]);
    }
}
