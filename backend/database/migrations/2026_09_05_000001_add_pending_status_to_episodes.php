<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Status 'pending' = episode diajukan creator, menunggu persetujuan admin.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE episodes MODIFY COLUMN status ENUM('draft','pending','published') NOT NULL DEFAULT 'draft'");

            return;
        }

        // SQLite (mis. phpunit :memory:) tidak mendukung ALTER ... MODIFY ENUM,
        // dan grammarnya membuat CHECK constraint untuk kolom enum. Matikan
        // penegakan CHECK saja — nilai 'pending' langsung valid di tes.
        DB::statement('PRAGMA ignore_check_constraints = ON;');
    }

    public function down(): void
    {
        // Kembalikan episode yang sedang menunggu menjadi draft sebelum menghapus enum.
        DB::table('episodes')->where('status', 'pending')->update(['status' => 'draft']);

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE episodes MODIFY COLUMN status ENUM('draft','published') NOT NULL DEFAULT 'draft'");
        }
    }
};
