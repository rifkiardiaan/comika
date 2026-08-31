<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Set verification_status ke 'approved' untuk komik yang sudah terbit
        DB::table('comics')
            ->whereNotNull('published_at')
            ->update(['verification_status' => 'approved']);

        // Set verification_status ke 'pending' untuk komik draft
        DB::table('comics')
            ->whereNull('published_at')
            ->update(['verification_status' => 'pending']);
    }

    public function down(): void
    {
        // Nothing to undo
    }
};
