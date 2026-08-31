<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserNotBanned
{
    /**
     * Cek apakah user yang sedang login tidak diblokir.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            try {
                $banInfo = DB::table('users')
                    ->where('id', $user->id)
                    ->select('is_banned', 'is_permanently_banned', 'ban_reason')
                    ->first();

                if ($banInfo && ($banInfo->is_banned || $banInfo->is_permanently_banned)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akun Anda telah diblokir oleh admin.',
                        'ban_reason' => $banInfo->ban_reason,
                        'is_permanently_banned' => (bool) $banInfo->is_permanently_banned,
                    ], 403);
                }
            } catch (\Throwable $e) {
                // Kolom belum ada — abaikan, izinkan akses
            }
        }

        return $next($request);
    }
}
