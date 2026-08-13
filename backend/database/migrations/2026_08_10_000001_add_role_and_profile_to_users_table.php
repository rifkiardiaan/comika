<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->after('name');
            $table->enum('role', ['reader', 'creator', 'admin'])->default('reader')->after('email');
            $table->string('avatar_url')->nullable()->after('role');
            $table->unsignedBigInteger('coin_balance')->default(0)->after('avatar_url');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role', 'avatar_url', 'coin_balance', 'deleted_at']);
        });
    }
};
