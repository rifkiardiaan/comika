<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Comics: perluas enum verification_status dengan status 'blocked'
        // agar komik yang diblokir tampil di page Diblokir (terpisah dari Ditolak).
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE comics MODIFY COLUMN verification_status ENUM('draft','pending','approved','rejected','blocked') NOT NULL DEFAULT 'pending'");
        } else {
            DB::statement('PRAGMA ignore_check_constraints = ON;');
        }

        // Users: izin upload komik. false = creator masih bisa login tapi
        // tidak dapat mengupload komik baru (dipasang saat komiknya diblokir admin).
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('can_upload')->default(true)->after('role');
        });

        // Data lama: komik yang diblokir admin pada alur lama ditandai
        // status 'hiatus' + verification 'rejected' + belum terbit →
        // pindahkan ke status 'blocked' agar masuk page Diblokir.
        try {
            DB::table('comics')
                ->where('verification_status', 'rejected')
                ->where('status', 'hiatus')
                ->whereNull('published_at')
                ->where('rejection_reason', 'Komik diblokir oleh admin.')
                ->update(['verification_status' => 'blocked']);
        } catch (\Throwable $e) {
            // Kolom belum ada — abaikan
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE comics MODIFY COLUMN verification_status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'pending'");
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('can_upload');
        });
    }
};