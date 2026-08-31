<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Midtrans Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk Midtrans Snap API.
    | Dapatkan server_key dan client_key dari dashboard Midtrans:
    | - Sandbox: https://app.sandbox.midtrans.com
    | - Production: https://app.midtrans.com
    |
    */

    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    // false = sandbox (testing), true = production
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    // URL redirect setelah pembayaran selesai
    'callback_finish' => env('MIDTRANS_CALLBACK_FINISH', '/wallet?payment=success'),

    // Server notification URL (webhook dari Midtrans)
    'notification_url' => env('MIDTRANS_NOTIFICATION_URL', env('APP_URL') . '/api/v1/midtrans/notification'),

];
