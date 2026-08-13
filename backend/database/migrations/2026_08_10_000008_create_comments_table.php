<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('comic_id')->constrained()->cascadeOnDelete();
            $table->foreignId('episode_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->nullOnDelete();
            $table->text('content');
            $table->unsignedBigInteger('like_count')->default(0);
            $table->enum('status', ['active', 'hidden', 'deleted'])->default('active');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['comic_id', 'status']);
            $table->index('episode_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
