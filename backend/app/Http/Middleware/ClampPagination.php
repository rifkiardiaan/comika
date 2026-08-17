<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Batasi nilai `per_page` pagination agar tidak bisa dipakai untuk
 * serangan DoS (mis. per_page=999999999 → query & memori meledak).
 *
 * Berlaku untuk semua request API: nilai di-clamp ke rentang 1–100.
 * Batas atas 100 cukup untuk semua kasus penggunaan (list komik,
 * komentar, admin, dll.) — UI sendiri memakai 10–15 per halaman.
 */
class ClampPagination
{
    /** Batas atas per halaman. */
    private const MAX_PER_PAGE = 100;

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->filled('per_page')) {
            $value = max(1, min(self::MAX_PER_PAGE, (int) $request->query('per_page')));
            $request->merge(['per_page' => $value]);
        }

        return $next($request);
    }
}
