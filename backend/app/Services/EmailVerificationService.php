<?php

namespace App\Services;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/**
 * Verifikasi email COMIKA — dua cara:
 * 1. Link signed (60 menit) — diklik di browser.
 * 2. Kode 6 digit — dimasukkan manual di halaman /verify-email
 *    (bekerja juga di aplikasi mobile).
 *
 * Kode disimpan sebagai hash bcrypt (tidak bocor dari database),
 * berlaku 60 menit, dan langsung dihapus setelah berhasil diverifikasi.
 */
class EmailVerificationService
{
    /** Masa berlaku kode & link verifikasi (menit). */
    public const CODE_TTL_MINUTES = 60;

    /** Prefix kolom untuk konsistensi dengan kolom di users. */
    public const CODE_FIELD = 'email_verification_code';
    public const EXPIRES_FIELD = 'email_verification_code_expires_at';

    /**
     * Buat kode 6 digit baru, simpan hash + batas waktu, lalu kirim email
     * berisi kode + link verifikasi. Kode lama otomatis ditimpa (resend aman).
     *
     * @return string Kode plaintext (untuk dikirim via email).
     */
    public function send(User $user): string
    {
        $code = $this->newCode();
        $expiresAt = now()->addMinutes(self::CODE_TTL_MINUTES);

        $user->forceFill([
            self::CODE_FIELD => Hash::make($code),
            self::EXPIRES_FIELD => $expiresAt,
        ])->save();

        Mail::to($user->email)->send(new VerifyEmailMail(
            $user->name,
            VerifyEmailMail::urlFor($user),
            $code,
        ));

        return $code;
    }

    /**
     * Verifikasi kode yang dimasukkan user.
     *
     * @return bool true bila kode valid & berhasil menandai email terverifikasi
     */
    public function verify(User $user, string $code): bool
    {
        if ($user->hasVerifiedEmail()) {
            return true;
        }

        $storedHash = $user->{self::CODE_FIELD};
        $expiresAt = $user->{self::EXPIRES_FIELD};

        // Tidak ada kode / sudah kedaluwarsa
        if (! $storedHash || ! $expiresAt || now()->greaterThan($expiresAt)) {
            return false;
        }

        if (! Hash::check($code, $storedHash)) {
            return false;
        }

        $user->markEmailAsVerified();
        $user->forceFill([
            self::CODE_FIELD => null,
            self::EXPIRES_FIELD => null,
        ])->save();

        return true;
    }

    /** Generate kode acak 6 digit (000000–999999). */
    private function newCode(): string
    {
        return sprintf('%06d', random_int(0, 999999));
    }
}
