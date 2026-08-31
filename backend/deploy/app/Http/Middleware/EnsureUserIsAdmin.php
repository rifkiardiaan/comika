<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Hanya user dengan role admin yang boleh lewat.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengakses fitur ini.',
                'errors' => (object) [],
            ], 403);
        }

        return $next($request);
    }
}
