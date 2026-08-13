<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCreator
{
    /**
     * Hanya user dengan role creator yang boleh lewat.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isCreator()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya creator yang dapat mengakses fitur ini.',
                'errors' => (object) [],
            ], 403);
        }

        return $next($request);
    }
}
