<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWithdrawalRequest;
use App\Http\Resources\WithdrawalResource;
use App\Services\MonetizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorWithdrawalController extends Controller
{
    public function __construct(private readonly MonetizationService $monetizationService) {}

    /**
     * Daftar withdrawal milik creator.
     */
    public function index(Request $request): JsonResponse
    {
        $withdrawals = $request->user()->withdrawals()
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => WithdrawalResource::collection($withdrawals->items()),
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page' => $withdrawals->lastPage(),
                'per_page' => $withdrawals->perPage(),
                'total' => $withdrawals->total(),
            ],
        ]);
    }

    /**
     * Ajukan penarikan dana (butuh saldo earning yang tersedia).
     */
    public function store(StoreWithdrawalRequest $request): JsonResponse
    {
        $withdrawal = $this->monetizationService->requestWithdrawal(
            $request->user(),
            $request->only(['amount', 'bank_name', 'bank_account', 'bank_holder']),
        );

        return response()->json([
            'success' => true,
            'message' => 'Permintaan penarikan diajukan. Menunggu persetujuan admin.',
            'data' => new WithdrawalResource($withdrawal),
        ], 201);
    }
}
