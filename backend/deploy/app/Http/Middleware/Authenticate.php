<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     * COMIKA adalah pure API — tidak ada route 'login' web, jadi semua request
     * yang tidak terautentikasi mendapat respons JSON 401 (ditangani Handler).
     */
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
