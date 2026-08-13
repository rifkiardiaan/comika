<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Middleware\TrustHosts as Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrustHosts extends Middleware
{
    /**
     * Daftar host yang dipercaya (proteksi host-header poisoning).
     *
     * Default: host APP_URL + semua subdomainnya. Bila butuh host tambahan
     * (mis. IP langsung untuk health check), set env TRUSTED_HOSTS dengan
     * daftar dipisah koma, mis. comika.app,api.comika.app.
     *
     * @return array<int, string>
     */
    public function hosts(): array
    {
        $custom = env('TRUSTED_HOSTS');

        if ($custom) {
            return array_values(array_filter(array_map('trim', explode(',', $custom))));
        }

        return $this->allSubdomainsOfApplicationUrl();
    }

    /**
     * Hanya enforce di production. Di dev, request datang dari host yang
     * berbeda (127.0.0.1, localhost, dsb) — memblokirnya hanya menyulitkan.
     * Jika TRUSTED_HOSTS di-set eksplisit, tetap enforce di environment apa pun.
     */
    public function handle(Request $request, $next): Response
    {
        if (! app()->environment('production') && ! env('TRUSTED_HOSTS')) {
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}
