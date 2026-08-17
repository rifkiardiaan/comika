<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Endpoint unik per browser/device — dipakai juga untuk deteksi duplikat.
            // varchar (bukan text) agar bisa di-index unik di MySQL.
            $table->string('endpoint', 500);
            // Kunci enkripsi push: { p256dh, auth } dari PushSubscription browser
            $table->json('keys')->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();

            $table->unique('endpoint', 'push_subscriptions_endpoint_unique');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
