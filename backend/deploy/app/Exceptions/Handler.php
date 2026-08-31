<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        // Format respons error API yang konsisten: { success, message, errors }
        $this->renderable(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan.',
                    'errors' => (object) [],
                ], 404);
            }
        });

        $this->renderable(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint tidak ditemukan.',
                    'errors' => (object) [],
                ], 404);
            }
        });

        // Policy denial → format respons konsisten
        // (Laravel mengubah AuthorizationException menjadi AccessDeniedHttpException)
        $this->renderable(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Aksi tidak diizinkan.',
                    'errors' => (object) [],
                ], 403);
            }
        });

        // Error umum — jangan bocorkan detail exception di production (APP_DEBUG=false)
        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->is('api/*') && ! config('app.debug')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan pada server.',
                    'errors' => (object) [],
                ], 500);
            }
        });
    }

    /**
     * Format respons validasi gagal: { success: false, message, errors }.
     */
    protected function invalidJson($request, ValidationException $exception)
    {
        return response()->json([
            'success' => false,
            'message' => $exception->getMessage(),
            'errors' => $exception->errors(),
        ], $exception->status);
    }

    /**
     * Request API yang tidak terautentikasi → JSON 401, tanpa redirect ke route web.
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json([
            'success' => false,
            'message' => 'Tidak terautentikasi. Silakan login terlebih dahulu.',
            'errors' => (object) [],
        ], 401);
    }
}
