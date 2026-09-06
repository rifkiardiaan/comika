<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ModerateCommentRequest;
use App\Http\Resources\AdminCommentResource;
use App\Models\ActivityLog;
use App\Models\Comment;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCommentController extends Controller
{
    /**
     * Daftar komentar (moderasi) dengan filter status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Comment::query()
            ->with(['user:id,name,avatar_url', 'comic:id,title', 'episode:id,number,title,comic_id'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            if ($request->status === 'deleted') {
                $query->onlyTrashed();
            } else {
                $query->where('status', $request->status);
            }
        } else {
            $query->whereIn('status', [Comment::STATUS_ACTIVE, Comment::STATUS_HIDDEN]);
        }

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where('content', 'like', "%{$search}%");
        }

        $comments = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => AdminCommentResource::collection($comments->items()),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    /**
     * Sembunyikan / tampilkan komentar.
     */
    public function moderate(ModerateCommentRequest $request, Comment $comment): JsonResponse
    {
        $comment->update(['status' => $request->status]);

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_COMMENT_MODERATE,
            $request->status === Comment::STATUS_HIDDEN
                ? 'Admin menyembunyikan komentar di komik "' . ($comment->comic->title ?? '') . '"'
                : 'Admin menampilkan kembali komentar di komik "' . ($comment->comic->title ?? '') . '"',
            $comment
        );

        return response()->json([
            'success' => true,
            'message' => $request->status === Comment::STATUS_HIDDEN
                ? 'Komentar disembunyikan.'
                : 'Komentar ditampilkan kembali.',
            'data' => new AdminCommentResource(
                $comment->load(['user:id,name,avatar_url', 'comic:id,title', 'episode:id,number,title,comic_id'])
            ),
        ]);
    }

    /**
     * Hapus komentar (soft delete) — moderasi.
     */
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $comicTitle = $comment->comic->title ?? '';
        $comment->delete();

        // Riwayat aktivitas
        app(ActivityLogService::class)->log(
            $request->user(),
            ActivityLog::ACTION_COMMENT_MODERATE,
            'Admin menghapus komentar di komik "' . $comicTitle . '"',
            $comment
        );

        return response()->json([
            'success' => true,
            'message' => 'Komentar berhasil dihapus.',
            'data' => null,
        ]);
    }
}
