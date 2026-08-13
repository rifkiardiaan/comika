<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Origin yang diizinkan diambil dari env CORS_ALLOWED_ORIGINS (pisahkan
    | dengan koma). Untuk pengembangan lokal boleh '*' (API dipanggil dari
    | origin berbeda: localhost:5173, emulator, dsb). Di production set daftar
    | eksplisit, mis. https://comika.app (lihat docs/deployment).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', '*'))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
