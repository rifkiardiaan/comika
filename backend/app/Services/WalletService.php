<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Validation\ValidationException;

/**
 * Operasi dasar dompet koin (wallet).
 *
 * `wallets.coin_balance` adalah sumber kebenaran saldo koin; kolom
 * `users.coin_balance` dijaga sinkron di dalam transaksi yang sama agar
 * respons UserResource/AdminUserResource tetap akurat (blueprint: server
 * yang menghitung saldo, jangan percaya nilai dari client).
 */
class WalletService
{
    /**
     * Pastikan user memiliki wallet, buat dengan saldo 0 bila belum ada.
     */
    public function walletFor(User $user): Wallet
    {
        $wallet = $user->wallet()->first();

        if ($wallet) {
            return $wallet;
        }

        // Sinkronkan dengan nilai kolom denormalisasi bila user dibuat
        // sebelum fitur wallet (mis. akun lama) — konsisten dengan seeder.
        $wallet = $user->wallet()->create([
            'coin_balance' => $user->coin_balance,
        ]);

        return $wallet;
    }

    /**
     * Saldo koin user saat ini.
     */
    public function balance(User $user): int
    {
        return $this->walletFor($user)->coin_balance;
    }

    /**
     * Tambah saldo koin. Wajib dipanggil di dalam DB::transaction oleh pemanggil.
     */
    public function credit(User $user, int $coins): Wallet
    {
        if ($coins <= 0) {
            throw new \InvalidArgumentException('Jumlah koin harus lebih dari nol.');
        }

        $wallet = $this->walletFor($user);
        $wallet->increment('coin_balance', $coins);

        // Sinkronkan kolom denormalisasi di users
        $user->update(['coin_balance' => $wallet->fresh()->coin_balance]);

        return $wallet->fresh();
    }

    /**
     * Kurangi saldo koin. Melempar ValidationException (422) bila saldo tidak cukup.
     * Wajib dipanggil di dalam DB::transaction oleh pemanggil.
     */
    public function debit(User $user, int $coins): Wallet
    {
        if ($coins <= 0) {
            throw new \InvalidArgumentException('Jumlah koin harus lebih dari nol.');
        }

        $wallet = $this->walletFor($user);

        // Kunci baris wallet untuk mencegah race condition pembelanjaan ganda
        $locked = Wallet::query()
            ->whereKey($wallet->id)
            ->lockForUpdate()
            ->firstOrFail();

        if ($locked->coin_balance < $coins) {
            throw ValidationException::withMessages([
                'coins' => ['Saldo koin tidak cukup. Silakan top up terlebih dahulu.'],
            ]);
        }

        $locked->decrement('coin_balance', $coins);

        // Sinkronkan kolom denormalisasi di users
        $user->update(['coin_balance' => $locked->fresh()->coin_balance]);

        return $locked->fresh();
    }
}
