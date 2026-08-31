<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('active_readers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('comic_id')->constrained()->cascadeOnDelete();
            $table->foreignId('episode_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('last_page')->default(1);
            $table->decimal('progress', 5, 2)->default(0);
            $table->timestamp('last_heartbeat_at');
            $table->timestamps();

            $table->unique(['user_id', 'episode_id']);
            $table->index(['last_heartbeat_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('active_readers');
    }
};
