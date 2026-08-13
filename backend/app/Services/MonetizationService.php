<?php

namespace App\Services;

use App\Models\CoinPackage;
use App\Models\CreatorEarning;
use App\Models\Episode;
use App\Models\EpisodeUnlock;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Logika bisnis monetisasi COMIKA (Phase 09).
 *
 * Aturan finansial (dari blueprint):
 * - Semua operasi finansial wajib dalam database transaction.
 * - Referensi transaksi immutable & unik — cegah pemrosesan ganda.
 * - Server yang menghitung saldo & nominal — jangan percaya client.
 * - Saldo koin bersumber dari `wallets` (lihat WalletService).
 *
 * Konversi (aturan bisnis MVP, dikonfigurasi di sini):
 * - 1 koin bernilai nominal Rp 100.
 * - Creator menerima 60% dari nilai unlock episode premium.
 */
class MonetizationService
{
    /** Nilai nominal 1 koin dalam rupiah. */
    public const COIN_VALUE = 100;

    /** Persentase share creator (60%) dari nilai unlock. */
    public const CREATOR_SHARE = 0.60;

    public function __construct(private readonly WalletService $walletService) {}

    /**
     * Beli paket koin. MVP: tanpa payment gateway — pembayaran
     * disimulasikan berhasil instan (payment_method 'mock').
     */
    public function purchasePackage(User $user, CoinPackage $package): Transaction
    {
        return DB::transaction(function () use ($user, $package) {
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'reference' => $this->newReference('PUR'),
                'type' => Transaction::TYPE_COIN_PURCHASE,
                'status' => Transaction::STATUS_SUCCESS,
                'amount' => $package->price,
                'coins' => $package->coins,
                'payment_method' => 'mock',
                'payment_ref' => 'SIM-'.strtoupper(Str::random(10)),
                'paid_at' => now(),
            ]);

            $this->walletService->credit($user, $package->coins);

            return $transaction->fresh();
        });
    }

    /**
     * Unlock episode premium:
     * 1. Validasi episode published & premium (kecuali pemilik komik).
     * 2. Cek saldo koin (row lock).
     * 3. Potong koin + catat transaksi + unlock + earning creator.
     *
     * Idempotent: unlock ulang tidak dikenai biaya.
     *
     * @return array<string, mixed>
     */
    public function unlockEpisode(User $user, Episode $episode): array
    {
        try {
            return DB::transaction(function () use ($user, $episode) {
                $isOwner = $user->id === $episode->comic->creator_id;

                if ($isOwner) {
                    return $this->ownerResult($user);
                }

                if ($episode->status !== Episode::STATUS_PUBLISHED) {
                    throw ValidationException::withMessages([
                        'episode' => ['Episode belum dipublikasikan.'],
                    ]);
                }

                if (! $episode->is_premium || $episode->price_coin <= 0) {
                    throw ValidationException::withMessages([
                        'episode' => ['Episode ini gratis dan tidak perlu di-unlock.'],
                    ]);
                }

                $existing = $this->findUnlock($user, $episode);

                if ($existing) {
                    return $this->existingUnlockResult($user, $existing);
                }

                $this->walletService->debit($user, $episode->price_coin);

                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'reference' => $this->newReference('UNL'),
                    'type' => Transaction::TYPE_EPISODE_UNLOCK,
                    'status' => Transaction::STATUS_SUCCESS,
                    'amount' => 0,
                    'coins' => $episode->price_coin,
                    'paid_at' => now(),
                ]);

                $unlock = EpisodeUnlock::create([
                    'user_id' => $user->id,
                    'episode_id' => $episode->id,
                    'transaction_id' => $transaction->id,
                    'coins_spent' => $episode->price_coin,
                ]);

                $this->recordCreatorEarning($episode, $transaction);

                return [
                    'unlock' => $unlock->load('episode.comic'),
                    'transaction' => $transaction,
                    'earning' => null,
                    'balance' => $this->walletService->balance($user),
                    'is_unlocked' => true,
                    'owner' => false,
                    'created' => true,
                ];
            });
        } catch (QueryException $e) {
            // Kompetisi request: unlock sudah dibuat oleh request lain
            // (unique user_id+episode_id). Rollback otomatis mencegah
            // potongan ganda — balas dengan status sudah unlock.
            if ($this->isUniqueViolation($e)) {
                $existing = $this->findUnlock($user, $episode);

                return $existing
                    ? $this->existingUnlockResult($user, $existing)
                    : throw $e;
            }

            throw $e;
        }
    }

    /**
     * @return array{unlock: null, transaction: null, earning: null, balance: int, is_unlocked: true, owner: true, created: false}
     */
    private function ownerResult(User $user): array
    {
        return [
            'unlock' => null,
            'transaction' => null,
            'earning' => null,
            'balance' => $this->walletService->balance($user),
            'is_unlocked' => true,
            'owner' => true,
            'created' => false,
        ];
    }

    private function findUnlock(User $user, Episode $episode): ?EpisodeUnlock
    {
        return EpisodeUnlock::where('user_id', $user->id)
            ->where('episode_id', $episode->id)
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function existingUnlockResult(User $user, EpisodeUnlock $existing): array
    {
        return [
            'unlock' => $existing->load('episode.comic', 'transaction'),
            'transaction' => $existing->transaction,
            'earning' => null,
            'balance' => $this->walletService->balance($user),
            'is_unlocked' => true,
            'owner' => false,
            'created' => false,
        ];
    }

    private function isUniqueViolation(QueryException $e): bool
    {
        $code = $e->errorInfo[1] ?? null;

        return in_array($code, [1062, 19, 23505], true); // MySQL, SQLite, PostgreSQL
    }

    /**
     * Catat earning untuk creator komik dari transaksi unlock.
     */
    private function recordCreatorEarning(Episode $episode, Transaction $transaction): CreatorEarning
    {
        $amount = round($episode->price_coin * self::COIN_VALUE * self::CREATOR_SHARE, 2);

        return CreatorEarning::create([
            'creator_id' => $episode->comic->creator_id,
            'episode_id' => $episode->id,
            'transaction_id' => $transaction->id,
            'amount' => $amount,
            'status' => CreatorEarning::STATUS_PENDING,
        ]);
    }

    /**
     * Ringkasan earning & saldo yang bisa ditarik untuk creator.
     *
     * @return array{pending: float, paid: float, total: float, available: float, pending_withdrawals: float}
     */
    public function earningsSummary(User $creator): array
    {
        $pending = (float) CreatorEarning::where('creator_id', $creator->id)
            ->where('status', CreatorEarning::STATUS_PENDING)->sum('amount');
        $paid = (float) CreatorEarning::where('creator_id', $creator->id)
            ->where('status', CreatorEarning::STATUS_PAID)->sum('amount');

        $pendingWithdrawals = (float) Withdrawal::where('creator_id', $creator->id)
            ->whereIn('status', [Withdrawal::STATUS_PENDING, Withdrawal::STATUS_APPROVED])
            ->sum('amount');

        return [
            'pending' => round($pending, 2),
            'paid' => round($paid, 2),
            'total' => round($pending + $paid, 2),
            'available' => round(max(0, $pending - $pendingWithdrawals), 2),
            'pending_withdrawals' => round($pendingWithdrawals, 2),
        ];
    }

    /**
     * Ajukan penarikan dana (withdrawal) — dana menunggu persetujuan admin.
     *
     * @param  array{bank_name: string, bank_account: string, bank_holder: string, amount: float|int}  $data
     */
    public function requestWithdrawal(User $creator, array $data): Withdrawal
    {
        return DB::transaction(function () use ($creator, $data) {
            $available = $this->earningsSummary($creator)['available'];
            $amount = round((float) $data['amount'], 2);

            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => ['Nominal penarikan harus lebih dari nol.'],
                ]);
            }

            if ($amount > $available) {
                throw ValidationException::withMessages([
                    'amount' => ['Saldo penarikan tidak mencukupi. Tersedia Rp '.number_format($available, 0, ',', '.').'.'],
                ]);
            }

            $withdrawal = Withdrawal::create([
                'creator_id' => $creator->id,
                'amount' => $amount,
                'status' => Withdrawal::STATUS_PENDING,
                'bank_name' => $data['bank_name'],
                'bank_account' => $data['bank_account'],
                'bank_holder' => $data['bank_holder'],
            ]);

            // Transaksi withdrawal dicatat sebagai pending; menjadi success saat dibayar.
            // Terhubung via withdrawal.transaction_id agar tidak ambigu saat ada
            // beberapa withdrawal bernominal sama.
            $transaction = Transaction::create([
                'user_id' => $creator->id,
                'reference' => $this->newReference('WDL'),
                'type' => Transaction::TYPE_WITHDRAWAL,
                'status' => Transaction::STATUS_PENDING,
                'amount' => $amount,
                'coins' => 0,
                'payment_method' => 'bank_transfer',
            ]);

            $withdrawal->update(['transaction_id' => $transaction->id]);

            return $withdrawal->fresh();
        });
    }

    /**
     * Proses withdrawal oleh admin (approved / rejected / paid).
     * Saat 'paid', earning pending creator ditandai paid secara FIFO
     * hingga nominal penarikan terpenuhi.
     */
    public function handleWithdrawal(Withdrawal $withdrawal, string $status, ?string $adminNote = null): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $status, $adminNote) {
            if ($withdrawal->status === Withdrawal::STATUS_PAID) {
                throw ValidationException::withMessages([
                    'status' => ['Withdrawal sudah dibayar dan tidak dapat diubah.'],
                ]);
            }

            $withdrawal->update([
                'status' => $status,
                'admin_note' => $adminNote,
                'processed_at' => now(),
            ]);

            $creatorTransaction = $withdrawal->transaction_id
                ? $withdrawal->transaction()->first()
                : null;

            if ($status === Withdrawal::STATUS_REJECTED) {
                $creatorTransaction?->update([
                    'status' => Transaction::STATUS_FAILED,
                ]);

                return $withdrawal->fresh();
            }

            if ($status === Withdrawal::STATUS_PAID) {
                $creatorTransaction?->update([
                    'status' => Transaction::STATUS_SUCCESS,
                    'paid_at' => now(),
                ]);

                $this->markEarningsPaid($withdrawal->creator_id, (float) $withdrawal->amount);
            }

            return $withdrawal->fresh();
        });
    }

    /**
     * Tandai earning pending sebagai paid (FIFO) hingga nominal terpenuhi.
     */
    private function markEarningsPaid(int $creatorId, float $amount): void
    {
        $remaining = $amount;

        CreatorEarning::query()
            ->where('creator_id', $creatorId)
            ->where('status', CreatorEarning::STATUS_PENDING)
            ->orderBy('id')
            ->get()
            ->each(function (CreatorEarning $earning) use (&$remaining) {
                if ($remaining <= 0) {
                    return false;
                }

                $earning->update([
                    'status' => CreatorEarning::STATUS_PAID,
                    'paid_at' => now(),
                ]);
                $remaining -= (float) $earning->amount;

                return true;
            });
    }

    /**
     * Buat referensi transaksi unik (immutable).
     */
    private function newReference(string $prefix): string
    {
        return strtoupper($prefix.'-'.now()->format('ymd').'-'.Str::random(10));
    }
}
