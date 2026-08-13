<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailVerificationController extends Controller
{
    /**
     * Kirim ulang link verifikasi email.
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

        Mail::to($user->email)->send(new VerifyEmailMail(
            $user->name,
            VerifyEmailMail::urlFor($user),
        ));

        return response()->json([
            'success' => true,
            'message' => 'Link verifikasi telah dikirim ke email kamu.',
            'data' => null,
        ]);
    }
}
