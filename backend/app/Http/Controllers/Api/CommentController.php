<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Comic;
use App\Models\Episode;
use App\Services\CommentService;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(private readonly CommentService $commentService)
    {
    }

    /**
     * Daftar komentar komik (top-level + balasan), paginated.
     */
    public function index(Request $request, Comic $comic): JsonResponse
    {
        $comments = $this->commentService->listFor(
            $comic,
            null,
            $request->integer('per_page', 10),
        );

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => CommentResource::collection($comments->items()),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    /**
     * Daftar komentar episode.
     */
    public function indexEpisode(Request $request, Episode $episode): JsonResponse
    {
        $comments = $this->commentService->listFor(
            $episode->comic,
            $episode,
            $request->integer('per_page', 10),
        );

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => CommentResource::collection($comments->items()),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    /**
     * Buat komentar pada komik.
     */
    public function store(StoreCommentRequest $request, Comic $comic): JsonResponse
    {
        $comment = $this->commentService->create(
            $request->user(),
            $comic,
            $request->only(['content', 'parent_id', 'episode_id']),
        );

        $comment->load('user');

        // Gamification: XP komentar
        app(GamificationService::class)->trackComment($request->user());

        $this->notifyReply($request, $comic, $comment);

        return response()->json([
            'success' => true,
            'message' => 'Komentar berhasil dikirim.',
            'data' => new CommentResource($comment),
        ], 201);
    }

    /**
     * Buat komentar pada episode.
     */
    public function storeEpisode(StoreCommentRequest $request, Episode $episode): JsonResponse
    {
        // Komentar episode hanya untuk episode yang sudah tayang
        if ($episode->status !== Episode::STATUS_PUBLISHED
            && $request->user()->id !== $episode->comic->creator_id) {
            return response()->json([
                'success' => false,
                'message' => 'Episode belum dipublikasikan.',
                'errors' => (object) [],
            ], 404);
        }

        // episode_id selalu dari URL, jangan percaya input client
        $data = $request->only(['content', 'parent_id']);
        $data['episode_id'] = $episode->id;

        $comment = $this->commentService->create(
            $request->user(),
            $episode->comic,
            $data,
        );

        $comment->load('user');

        // Gamification: XP komentar
        app(GamificationService::class)->trackComment($request->user());

        $this->notifyReply($request, $episode->comic, $comment);

        return response()->json([
            'success' => true,
            'message' => 'Komentar berhasil dikirim.',
            'data' => new CommentResource($comment),
        ], 201);
    }

    /**
     * Ubah komentar milik sendiri.
     */
    public function update(UpdateCommentRequest $request, Comment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        $updated = $this->commentService->update($comment, $request->only('content'));
        $updated->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Komentar diperbarui.',
            'data' => new CommentResource($updated),
        ]);
    }

    /**
     * Hapus komentar milik sendiri (soft delete + balasannya).
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $this->commentService->destroy($comment);

        return response()->json([
            'success' => true,
            'message' => 'Komentar dihapus.',
            'data' => null,
        ]);
    }

    /**
     * Kirim notifikasi "balasan komentar" ke penulis komentar induk
     * (kecuali jika membalas komentar sendiri).
     */
    private function notifyReply(Request $request, Comic $comic, Comment $comment): void
    {
        $parentId = $comment->parent_id;
        if (! $parentId) {
            return;
        }

        $parent = Comment::find($parentId);
        if (! $parent || $parent->user_id === $request->user()->id) {
            return;
        }

        app(NotificationService::class)->send(
            $parent->user_id,
            NotificationService::TYPE_COMMENT_REPLY,
            [
                'comic_id' => $comic->id,
                'comic_title' => $comic->title,
                'comment_id' => $comment->id,
                'reply_snippet' => Str::limit($comment->content, 120),
            ]
        );
    }
}
