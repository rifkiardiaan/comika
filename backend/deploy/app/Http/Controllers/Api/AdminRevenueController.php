<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use App\Services\RevenueShareService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Pengaturan pembagian pendapatan penjualan komik berbayar — admin only.
 *
 * Admin dapat melihat dan mengubah persentase pendapatan creator vs
 * platform. Nilai dipakai saat menghitung earning pada unlock episode
 * premium (MonetizationService) dan laporan pendapatan admin.
 */
class AdminRevenueController extends Controller
{
    public function __construct(
        private readonly RevenueShareService $revenueShareService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    /**
     * Status pembagian pendapatan + ringkasan pendapatan platform.
     */
    public function index(Request $request): JsonResponse
    {
        $totalCoins = (int) $request->input('total_coins', 0);
        $adminShare = $this->revenueShareService->adminShare();
        $coinValue = $this->revenueShareService->coinValue();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'settings' => $this->revenueShareService->settings(),
                'preview' => [
                    'total_coins' => $totalCoins,
                    'total_revenue' => round($totalCoins * $coinValue, 2),
                    'creator_earnings' => round($totalCoins * $coinValue * $this->revenueShareService->creatorShare(), 2),
                    'admin_earnings' => round($totalCoins * $coinValue * $adminShare, 2),
                    'coin_value' => $coinValue,
                ],
            ],
        ]);
    }

    /**
     * Ubah persentase pembagian pendapatan creator vs platform.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'creator_share' => 'required|numeric|between:0.05,0.95',
            'coin_value' => 'nullable|integer|min:10|max:1000000',
        ]);

        $previous = $this->revenueShareService->settings();
        $updated = $this->revenueShareService->saveShares(
            (float) $validated['creator_share'],
            isset($validated['coin_value']) ? (int) $validated['coin_value'] : null,
        );

        $this->activityLogService->log(
            $request->user(),
            ActivityLog::ACTION_SETTING_UPDATE,
            'Admin mengubah pembagian pendapatan: creator '.round($updated['creator_share'] * 100, 1).'% / platform '.round($updated['admin_share'] * 100, 1).'% (sebelumnya '.round($previous['creator_share'] * 100, 1).'% / '.round($previous['admin_share'] * 100, 1).'%).',
            null,
            ['creator_share' => $updated['creator_share'], 'admin_share' => $updated['admin_share'], 'coin_value' => $updated['coin_value']],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Pembagian pendapatan berhasil diperbarui.',
            'data' => $updated,
        ]);
    }
}