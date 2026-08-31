<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Web Push (VAPID)
    |--------------------------------------------------------------------------
    |
    | Kunci VAPID untuk mengirim web push notification ke browser.
    | Generate pasangan kunci dengan:
    |   php artisan webpush:keys
    | Lalu isi VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY di .env.
    | Public key (base64url) juga dikirim ke frontend via GET /api/v1/push/vapid-public-key
    | agar browser bisa subscribe.
    |
    */
    'webpush' => [
        'vapid' => [
            'subject' => env('VAPID_SUBJECT', 'mailto:noreply@comika.app'),
            'public_key' => env('VAPID_PUBLIC_KEY'),
            'private_key' => env('VAPID_PRIVATE_KEY'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | AI Assistant (blueprint 27)
    |--------------------------------------------------------------------------
    |
    | Optional service — biarkan AI_API_KEY kosong bila tidak dipakai.
    | Client OpenAI-compatible (bekerja dengan OpenAI, Groq, OpenRouter,
    | dan endpoint lain yang memakai format /chat/completions).
    |
    | Bila key kosong, AiService memakai generator rule-based bawaan
    | (deterministik, tanpa API) sehingga fitur tetap berfungsi untuk demo.
    |
    */
    'ai' => [
        'base_url' => env('AI_BASE_URL', 'https://api.openai.com/v1'),
        'api_key' => env('AI_API_KEY'),
        'model' => env('AI_MODEL', 'gpt-4o-mini'),
        'timeout' => (int) env('AI_TIMEOUT', 60),
    ],

];
