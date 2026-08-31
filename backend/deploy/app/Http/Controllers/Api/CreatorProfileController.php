<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCreatorProfileRequest;
use App\Http\Resources\CreatorProfileResource;
use App\Models\CreatorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CreatorProfileController extends Controller
{
    /**
     * Profil creator user yang login (dibuat otomatis jika belum ada).
     */
    public function show(Request $request): JsonResponse
    {
        $profile = CreatorProfile::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['display_name' => $request->user()->name],
        );

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new CreatorProfileResource($profile),
        ]);
    }

    /**
     * Update profil creator.
     */
    public function update(UpdateCreatorProfileRequest $request): JsonResponse
    {
        $data = $request->only(['display_name', 'bio']);

        if ($request->hasFile('banner')) {
            // Buang banner lama agar storage tidak menumpuk
            $old = CreatorProfile::where('user_id', $request->user()->id)->value('banner_url');
            if ($old) {
                Storage::disk('public')->delete($old);
            }

            $data['banner_url'] = $request->file('banner')->store('creator-banners', 'public');
        }

        $profile = CreatorProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data,
        );

        return response()->json([
            'success' => true,
            'message' => 'Profil creator diperbarui.',
            'data' => new CreatorProfileResource($profile),
        ]);
    }
}
