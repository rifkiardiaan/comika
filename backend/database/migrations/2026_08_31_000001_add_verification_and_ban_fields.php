<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Comics: tambah kolom verification_status untuk tracking verifikasi upload
        Schema::table('comics', function (Blueprint $table) {
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->after('age_rating');
            $table->text('rejection_reason')->nullable()->after('verification_status');
        });

        // Users: tambah kolom ban untuk blokir akun
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_banned')->default(false)->after('is_vvip');
            $table->boolean('is_permanently_banned')->default(false)->after('is_banned');
            $table->text('ban_reason')->nullable()->after('is_permanently_banned');
        });
    }

    public function down(): void
    {
        Schema::table('comics', function (Blueprint $table) {
            $table->dropColumn(['verification_status', 'rejection_reason']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_banned', 'is_permanently_banned', 'ban_reason']);
        });
    }
};
