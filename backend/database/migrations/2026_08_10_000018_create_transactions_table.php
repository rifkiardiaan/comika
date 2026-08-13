<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference', 40)->unique();
            $table->enum('type', ['coin_purchase', 'episode_unlock', 'earning', 'withdrawal']);
            $table->enum('status', ['pending', 'success', 'failed', 'refunded'])->default('pending');
            $table->decimal('amount', 12, 2)->default(0);
            $table->unsignedBigInteger('coins')->default(0);
            $table->string('payment_method', 40)->nullable();
            $table->string('payment_ref', 100)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
