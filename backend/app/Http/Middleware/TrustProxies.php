<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * Di shared hosting, request selalu melewati proxy/edge hosting yang
     * mengakhiri SSL, lalu diteruskan ke PHP via HTTP internal. Tanpa
     * memercayai proxy tersebut, $request->isSecure() selalu false
     * sehingga HSTS & URL absolut HTTPS tidak pernah terbentuk.
     *
     * Nilai diambil dari env TRUSTED_PROXIES (default '*': percaya semua
     * proxy — pola umum shared hosting). Bila di VPS dengan IP proxy
     * spesifik, set daftar IP dipisah koma.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*';

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;

    /**
     * Baca TRUSTED_PROXIES dari env agar bisa diubah tanpa edit kode.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $configured = env('TRUSTED_PROXIES');

        if ($configured !== null && $configured !== '') {
            $this->proxies = str_contains($configured, ',')
                ? array_map('trim', explode(',', $configured))
                : $configured;
        }

        return parent::handle($request, $next);
    }
}
