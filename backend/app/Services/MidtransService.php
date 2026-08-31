<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction as MidtransTransaction;

/**
 * Service untuk integrasi Midtrans Payment Gateway.
 *
 * Menggunakan Snap API untuk frontend payment page.
 * URL production: https://app.midtrans.com
 * URL sandbox: https://app.sandbox.midtrans.com
 */
class MidtransService
{
    public function __construct()
    {
        $this->configure();
    }

    /**
     * Konfigurasi Midtrans credentials dari .env.
     */
    private function configure(): void
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Buat Snap Token untuk pembayaran.
     *
     * @param  array{order_id: string, gross_amount: int, item_name: string, item_id: string, item_price: int, item_qty: int, customer_first_name: string, customer_email: string, expiry_duration?: int}  $params
     * @return array{token: string, redirect_url: string}
     */
    public function createSnapToken(array $params): array
    {
        $transactionDetails = [
            'order_id' => $params['order_id'],
            'gross_amount' => $params['gross_amount'],
        ];

        $itemDetails = [
            [
                'id' => $params['item_id'],
                'name' => $params['item_name'],
                'price' => $params['item_price'],
                'quantity' => $params['item_qty'] ?? 1,
            ],
        ];

        $customerDetails = [
            'first_name' => $params['customer_first_name'] ?? 'User',
            'email' => $params['customer_email'],
        ];

        // Opsi expiry (default: 24 jam)
        $expiryDuration = $params['expiry_duration'] ?? 24;

        $transactionData = [
            'transaction_details' => $transactionDetails,
            'item_details' => $itemDetails,
            'customer_details' => $customerDetails,
            'expiry' => [
                'start' => now()->toIso8601String(),
                'unit' => 'hour',
                'duration' => $expiryDuration,
            ],
            'callbacks' => [
                'finish' => config('midtrans.callback_finish', url('/')),
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($transactionData);

            return [
                'token' => $snapToken,
                'redirect_url' => config('midtrans.is_production')
                    ? 'https://app.midtrans.com/snap/v2/vtweb/' . $snapToken
                    : 'https://app.sandbox.midtrans.com/snap/vtweb/' . $snapToken,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Snap Token Error: ' . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Verifikasi notifikasi dari Midtrans (server-to-server).
     *
     * @return array{order_id: string, transaction_status: string, fraud_status: string, payment_type: string, gross_amount: string}
     */
    public function verifyNotification(array $notificationData): array
    {
        try {
            $api = new MidtransTransaction();
            $status = $api->status($notificationData['order_id']);

            return [
                'order_id' => $status->order_id,
                'transaction_status' => $status->transaction_status,
                'fraud_status' => $status->fraud_status ?? '',
                'payment_type' => $status->payment_type ?? '',
                'gross_amount' => $status->gross_amount ?? '',
                'va_number' => $status->va_number ?? null,
                'bank' => $status->bank ?? null,
                'card_type' => $status->card_type ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Notification Verification Error: ' . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Cek status transaksi langsung dari Midtrans.
     *
     * @return array{order_id: string, transaction_status: string, payment_type: string}
     */
    public function getTransactionStatus(string $orderId): array
    {
        try {
            $api = new MidtransTransaction();
            $status = $api->status($orderId);

            return [
                'order_id' => $status->order_id,
                'transaction_status' => $status->transaction_status,
                'payment_type' => $status->payment_type ?? '',
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Status Check Error: ' . $e->getMessage());

            throw $e;
        }
    }

    /**
     * Map Midtrans transaction_status ke status internal kita.
     */
    public function mapStatus(string $midtransStatus, string $fraudStatus = ''): string
    {
        // settlement = pembayaran berhasil
        if ($midtransStatus === 'settlement') {
            return 'success';
        }

        // capture dengan fraud accept
        if ($midtransStatus === 'capture' && $fraudStatus === 'accept') {
            return 'success';
        }

        // pending / process
        if (in_array($midtransStatus, ['pending', 'process'], true)) {
            return 'pending';
        }

        // deny = ditolak payment gateway
        if ($midtransStatus === 'deny') {
            return 'failed';
        }

        // expire = waktu habis
        if ($midtransStatus === 'expire') {
            return 'failed';
        }

        // cancel = dibatalkan
        if ($midtransStatus === 'cancel') {
            return 'failed';
        }

        // refund
        if ($midtransStatus === 'refund') {
            return 'refunded';
        }

        return 'pending';
    }
}
