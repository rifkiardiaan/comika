<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HandleReportRequest;
use App\Http\Resources\AdminReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    /**
     * Daftar laporan dengan filter status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Report::query()
            ->with(['reporter:id,name,username', 'handler:id,name', 'reportable'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => AdminReportResource::collection($reports->items()),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    /**
     * Detail laporan.
     */
    public function show(Report $report): JsonResponse
    {
        $report->load(['reporter:id,name,username', 'handler:id,name', 'reportable']);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new AdminReportResource($report),
        ]);
    }

    /**
     * Selesaikan / tolak laporan.
     */
    public function handle(HandleReportRequest $request, Report $report): JsonResponse
    {
        $report->update([
            'status' => $request->status,
            'admin_note' => $request->input('admin_note'),
            'handled_by' => $request->user()->id,
            'handled_at' => now(),
        ]);

        $report->load(['reporter:id,name,username', 'handler:id,name', 'reportable']);

        return response()->json([
            'success' => true,
            'message' => $request->status === Report::STATUS_RESOLVED
                ? 'Laporan diselesaikan.'
                : 'Laporan ditolak.',
            'data' => new AdminReportResource($report),
        ]);
    }
}
