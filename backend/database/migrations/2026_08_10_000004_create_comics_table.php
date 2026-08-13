<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 120);
            $table->string('slug', 140)->unique();
            $table->text('synopsis');
            $table->string('cover_url')->nullable();
            $table->enum('status', ['ongoing', 'completed', 'hiatus'])->default('ongoing');
            $table->enum('age_rating', ['semua_umur', 'remaja', 'dewasa'])->default('semua_umur');
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedBigInteger('rating_count')->default(0);
            $table->unsignedBigInteger('like_count')->default(0);
            $table->unsignedBigInteger('view_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'rating_avg']);
            $table->index('view_count');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comics');
    }
};
