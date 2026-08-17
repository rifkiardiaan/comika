<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VerifyEmailCodeRequest;
use App\Services\EmailVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EmailVerificationController extends Controller
{
    public function __construct(private readonly EmailVerificationService $verification)
    {
    }

    /**
     * Kirim ulang email verifikasi (kode 6 digit + link).
     * Butuh login (endpoint dilindungi auth:sanctum).
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Email sudah terverifikasi.',
                'data' => null,
            ]);
        }

        $this->verification->send($user);

        return response()->json([
            'success' => true,
            'message' => 'Email verifikasi (kode 6 digit + link) telah dikirim ke email kamu.',
            'data' => null,
        ]);
    }

    /**
     * Verifikasi email dengan kode 6 digit dari email.
     * Butuh login (endpoint dilindungi auth:sanctum).
     */
    public function verifyCode(VerifyEmailCodeRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Email sudah terverifikasi.',
                'data' => ['verified' => true],
            ]);
        }

        $ok = $this->verification->verify($user, $request->code);

        if (! $ok) {
            throw ValidationException::withMessages([
                'code' => ['Kode verifikasi salah atau sudah kedaluwarsa. Minta kode baru.'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Email berhasil diverifikasi. 🎉',
            'data' => ['verified' => true],
        ]);
    }
}
