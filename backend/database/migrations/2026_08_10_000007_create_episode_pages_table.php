<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episode_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('page_number');
            $table->string('image_url', 255);
            $table->timestamps();

            $table->unique(['episode_id', 'page_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episode_pages');
    }
};
