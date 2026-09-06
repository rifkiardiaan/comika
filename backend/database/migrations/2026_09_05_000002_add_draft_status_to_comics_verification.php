<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Status 'draft' = komik baru yang belum diajukan creator untuk direview admin.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE comics MODIFY COLUMN verification_status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'pending'");

            return;
        }

        // SQLite (mis. phpunit :memory:) — matikan penegakan CHECK constraint enum.
        DB::statement('PRAGMA ignore_check_constraints = ON;');
    }

    public function down(): void
    {
        // Kembalikan komik draft menjadi pending sebelum menghapus enum.
        DB::table('comics')->where('verification_status', 'draft')->update(['verification_status' => 'pending']);

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE comics MODIFY COLUMN verification_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
        }
    }
};
