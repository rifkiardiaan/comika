<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Wallet;
use App\Services\EmailVerificationService;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Daftar akun baru (role: reader).
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // User + wallet dibuat dalam satu transaction (blueprint: operasi finansial wajib transactional)
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => $request->password,
                'role' => User::ROLE_READER,
            ]);

            Wallet::create([
                'user_id' => $user->id,
                'coin_balance' => 0,
            ]);

            // Muat ulang agar atribut default DB (coin_balance dsb.)
            // ikut terbawa ke respons — model baru tanpa fresh()
            // masih bernilai null untuk kolom yang tidak di-set.
            return $user->fresh();
        });

        $token = $user->createToken('auth')->plainTextToken;

        // Kirim email verifikasi berisi kode 6 digit + link signed (60 menit).
        // Akun sudah dibuat — kegagalan SMTP tidak boleh menggagalkan
        // registrasi; user bisa minta kirim ulang lewat endpoint resend.
        try {
            app(EmailVerificationService::class)->send($user);
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil. Periksa email untuk verifikasi akun.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Login dengan email + password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // COMIKA mendukung login multi-perangkat (web + mobile),
        // jadi token lama tidak dihapus. Token kedaluwarsa otomatis
        // dibersihkan sesuai config sanctum.expiration.
        $token = $user->createToken('auth')->plainTextToken;

        // Gamification: XP login harian (sekali per hari kalender)
        app(GamificationService::class)->trackDailyLogin($user);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Logout — cabut token yang sedang dipakai.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null,
        ]);
    }

    /**
     * Ambil data user yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => new UserResource($request->user()),
        ]);
    }

    /**
     * Ubah profil dasar: nama tampilan & avatar.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = ['name' => $request->name];

        if ($request->hasFile('avatar')) {
            // Buang avatar lama agar storage tidak menumpuk
            if ($user->avatar_url) {
                Storage::disk('public')->delete($user->avatar_url);
            }

            $data['avatar_url'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Ganti password akun — butuh password saat ini.
     * Token lain ikut dicabut agar sesi di perangkat lain harus login ulang.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'password' => $request->password,
        ]);

        // Cabut semua token kecuali yang sedang dipakai (currentAccessToken)
        $user->tokens()
            ->where('id', '!=', $user->currentAccessToken()->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah.',
            'data' => null,
        ]);
    }
}
