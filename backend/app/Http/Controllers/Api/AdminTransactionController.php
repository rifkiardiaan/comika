<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HandleWithdrawalRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\WithdrawalResource;
use App\Models\Transaction;
use App\Models\Withdrawal;
use App\Services\MonetizationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTransactionController extends Controller
{
    public function __construct(private readonly MonetizationService $monetizationService) {}

    /**
     * Daftar semua transaksi platform dengan filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::query()
            ->with(['user:id,name,username,email,avatar_url', 'unlocks.episode.comic'])
            ->orderByDesc('id');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->paginate($request->integer('per_page', 15));

        $items = $transactions->getCollection()->map(function (Transaction $transaction) {
            $data = (new TransactionResource($transaction))->resolve();
            $data['user'] = $transaction->user
                ? [
                    'id' => $transaction->user->id,
                    'name' => $transaction->user->name,
                    'username' => $transaction->user->username,
                    'email' => $transaction->user->email,
                    'avatar_url' => $transaction->user->avatar_url,
                ]
                : null;

            return $data;
        })->values();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $items,
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Daftar semua withdrawal platform.
     */
    public function withdrawals(Request $request): JsonResponse
    {
        $query = Withdrawal::query()
            ->with(['creator:id,name,username,email,avatar_url'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->whereHas('creator', function ($cq) use ($search) {
                $cq->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $withdrawals = $query->paginate($request->integer('per_page', 15));

        $items = $withdrawals->getCollection()->map(function (Withdrawal $withdrawal) {
            $data = (new WithdrawalResource($withdrawal))->resolve();
            $data['creator'] = $withdrawal->creator
                ? [
                    'id' => $withdrawal->creator->id,
                    'name' => $withdrawal->creator->name,
                    'username' => $withdrawal->creator->username,
                    'email' => $withdrawal->creator->email,
                    'avatar_url' => $withdrawal->creator->avatar_url,
                ]
                : null;

            return $data;
        })->values();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $items,
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page' => $withdrawals->lastPage(),
                'per_page' => $withdrawals->perPage(),
                'total' => $withdrawals->total(),
            ],
        ]);
    }

    /**
     * Proses withdrawal: approved / rejected / paid.
     */
    public function handleWithdrawal(HandleWithdrawalRequest $request, Withdrawal $withdrawal): JsonResponse
    {
        $updated = $this->monetizationService->handleWithdrawal(
            $withdrawal,
            $request->status,
            $request->input('admin_note'),
        );

        // Beri tahu creator status withdrawal-nya diperbarui admin
        app(NotificationService::class)->send(
            $withdrawal->creator_id,
            NotificationService::TYPE_TRANSACTION,
            [
                'withdrawal_id' => $withdrawal->id,
                'status' => $request->status,
                'amount' => $withdrawal->amount,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => match ($request->status) {
                Withdrawal::STATUS_APPROVED => 'Withdrawal disetujui.',
                Withdrawal::STATUS_REJECTED => 'Withdrawal ditolak.',
                default => 'Withdrawal ditandai dibayar. Earning creator diperbarui.',
            },
            'data' => new WithdrawalResource($updated->load('creator:id,name,username,email')),
        ]);
    }
}
