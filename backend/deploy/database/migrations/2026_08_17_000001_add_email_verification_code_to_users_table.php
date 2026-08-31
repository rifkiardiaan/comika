<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan kolom kode verifikasi email 6 digit.
     *
     * Kode disimpan sebagai hash (bcrypt) agar tidak bocor dari database;
     * expires_at membatasi masa berlaku (60 menit). User bisa verifikasi
     * lewat link signed ATAU memasukkan kode manual di halaman /verify-email.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email_verification_code')->nullable()->after('email_verified_at');
            $table->timestamp('email_verification_code_expires_at')->nullable()->after('email_verification_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_verification_code', 'email_verification_code_expires_at']);
        });
    }
};
