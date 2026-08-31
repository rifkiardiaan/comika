<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Kirim link reset password ke email (jika email terdaftar).
     * Selalu mengembalikan sukses untuk mencegah user enumeration.
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        // Normalisasi email ke lowercase agar lookup konsisten dengan
        // email yang disimpan saat registrasi.
        $request->merge(['email' => mb_strtolower(trim((string) $request->email))]);

        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email'),
            function (User $user, string $token) {
                try {
                    Mail::to($user->email)->send(new ResetPasswordMail(
                        $user->name,
                        ResetPasswordMail::urlFor($user->email, $token),
                    ));
                } catch (\Throwable $e) {
                    // Jangan gagalkan permintaan karena SMTP bermasalah —
                    // tetap balas sukses agar tidak membocorkan keberadaan email.
                    report($e);
                }
            }
        );

        // Selalu balas sukses & tanpa info status (anti user-enumeration),
        // baik email terdaftar maupun tidak.
        return response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, link reset password telah dikirim.',
            'data' => null,
        ]);
    }

    /**
     * Reset password dengan token dari email.
     */
    public function reset(Request $request): JsonResponse
    {
        // Normalisasi email ke lowercase agar lookup konsisten.
        $request->merge(['email' => mb_strtolower(trim((string) $request->email))]);

        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'confirmed', \Illuminate\Validation\Rules\Password::min(8)],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
                // Cabut semua token lama agar sesi lain ikut di-logout
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diatur ulang. Silakan masuk kembali.',
            'data' => null,
        ]);
    }
}
