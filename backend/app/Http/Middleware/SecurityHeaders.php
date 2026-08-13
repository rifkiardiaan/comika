<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security headers (Phase 12 — production hardening).
 *
 * Menambahkan header HTTP standar keamanan pada semua respons:
 * - nosniff: cegah MIME-type sniffing
 * - frame guard: cegah clickjacking (API tidak pernah di-frame)
 * - referrer policy: batasi info yang bocor lewat header Referer
 * - permissions policy: nonaktifkan fitur browser yang tidak dipakai
 * - HSTS (hanya HTTPS): paksa koneksi aman
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // HSTS hanya saat koneksi aman (HTTPS), agar tidak merusak dev HTTP.
        // Catatan: isSecure() baru benar bila TrustProxies memercayai proxy
        // hosting (lihat app/Http/Middleware/TrustProxies.php).
        // includeSubDomains sengaja tidak dipakai agar subdomain non-HTTPS
        // (mis. dev) tidak ikut terkunci.
        if (app()->environment('production') && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
        }

        return $response;
    }
}
