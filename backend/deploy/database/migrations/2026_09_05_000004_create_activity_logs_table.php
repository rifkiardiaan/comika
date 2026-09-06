<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Riwayat aktivitas (feature 13): catatan audit untuk upload komik,
     * publish/verifikasi, pembelian (coin/unlock/subscription), download
     * offline, dan tindakan moderasi admin.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            // Pelaku aksi (bisa null utk aksi sistem / webhook)
            $table->unsignedBigInteger('user_id')->nullable()->index();
            // Kategori aksi: comic_upload, comic_publish, comic_verify, comic_block,
            // episode_publish, episode_reject, episode_delete, coin_purchase,
            // episode_unlock, subscription, comic_download, comment_moderate,
            // user_ban, user_unban, user_permanent_ban, dst.
            $table->string('action', 60)->index();
            // Ringkasan yang mudah dibaca (bahasa Indonesia)
            $table->string('description', 500)->nullable();
            // Target subjek (mis. Comic::class / Episode::class) opsional
            $table->string('subject_type', 120)->nullable()->index();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index(['subject_type', 'subject_id']);
            $table->index('created_at');

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
