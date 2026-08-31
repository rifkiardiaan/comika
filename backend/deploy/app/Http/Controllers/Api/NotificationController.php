<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Daftar notifikasi user (terbaru dulu), paginated.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->appNotifications()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => NotificationResource::collection($notifications->items()),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Jumlah notifikasi yang belum dibaca (untuk badge).
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'unread_count' => $request->user()->appNotifications()->unread()->count(),
            ],
        ]);
    }

    /**
     * Tandai satu notifikasi sudah dibaca — hanya milik sendiri.
     */
    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        $this->assertOwnedBy($request, $notification);

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai sudah dibaca.',
            'data' => new NotificationResource($notification->fresh()),
        ]);
    }

    /**
     * Tandai semua notifikasi sudah dibaca.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $affected = $request->user()->appNotifications()->unread()->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai sudah dibaca.',
            'data' => ['updated' => $affected],
        ]);
    }

    /**
     * Hapus notifikasi — hanya milik sendiri.
     */
    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        $this->assertOwnedBy($request, $notification);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi dihapus.',
            'data' => null,
        ]);
    }

    /**
     * User hanya boleh mengakses notifikasi miliknya sendiri.
     */
    private function assertOwnedBy(Request $request, Notification $notification): void
    {
        abort_unless($notification->user_id === $request->user()->id, 404);
    }
}
