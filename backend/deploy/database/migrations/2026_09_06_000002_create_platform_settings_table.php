<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Nilai default pembagian pendapatan (disimpan di database agar
        // bisa diubah oleh admin dari dashboard tanpa deploy ulang).
        // - revenue.creator_share: persentase pendapatan untuk creator
        // - revenue.admin_share:   persentase pendapatan untuk platform/admin
        // - revenue.coin_value:    nilai nominal 1 koin dalam rupiah
        $defaults = [
            'revenue.creator_share' => 0.60,
            'revenue.admin_share' => 0.40,
            'revenue.coin_value' => 100,
        ];

        $now = now();
        foreach ($defaults as $key => $value) {
            DB::table('platform_settings')->insert([
                'key' => $key,
                'value' => (string) $value,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};