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

        // Content-Security-Policy (API murni JSON — blokir semua eksekusi
        // konten inline/eksternal sebagai pertahanan berlapis XSS).
        // API tidak pernah mengembalikan HTML, jadi policy ketat aman.
        $response->headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");

        // API JSON tidak boleh di-cache oleh browser/proxy (data privat).
        // Khusus untuk request autentikasi, cache bisa membocorkan data
        // antar user jika memakai shared proxy.
        if ($request->user() || $request->is('api/*')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        }

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
