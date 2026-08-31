<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('comic_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('score');
            $table->timestamps();

            $table->unique(['user_id', 'comic_id']);
            $table->index('score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
